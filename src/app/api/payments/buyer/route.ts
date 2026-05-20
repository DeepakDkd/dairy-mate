import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";

import {
  isPaymentMethod,
  jsonError,
  parseDateInput,
  parsePositiveInt,
  parsePositiveNumber,
  requireOwnedDairy,
} from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function syncLatestPayment(tx: Pick<typeof prisma, "payment" | "accountBalance">, dairyId: number, buyerId: number) {
  const latestPayment = await tx.payment.findFirst({
    where: {
      dairyId,
      userId: buyerId,
    },
    orderBy: [
      { date: "desc" },
      { id: "desc" },
    ],
    select: {
      id: true,
    },
  });

  await tx.accountBalance.updateMany({
    where: {
      dairyId,
      userId: buyerId,
    },
    data: {
      lastPaymentId: latestPayment?.id ?? null,
    },
  });
}

async function requireBuyerInOwnedDairy(
  session: Session,
  dairyId: number,
  buyerId: number
) {
  const dairyAccess = await requireOwnedDairy(session, dairyId);
  if (!dairyAccess.ok) {
    return dairyAccess;
  }

  const buyer = await prisma.user.findFirst({
    where: {
      id: buyerId,
      dairyId,
      role: "BUYER",
    },
    select: {
      id: true,
    },
  });

  if (!buyer) {
    return { ok: false as const, response: jsonError("Buyer not found", 404) };
  }

  return { ok: true as const };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { dairyId, buyerId, amount, method = "CASH", notes, date } = body;

    const dairyIdNum = parsePositiveInt(dairyId);
    const buyerIdNum = parsePositiveInt(buyerId);
    const amountNum = parsePositiveNumber(amount);

    if (!dairyIdNum || !buyerIdNum || !amountNum) {
      return jsonError("Invalid dairyId, buyerId or amount", 400);
    }

    if (!isPaymentMethod(method)) {
      return jsonError("Invalid payment method", 400);
    }

    const paymentDate = parseDateInput(date);
    if (!paymentDate) {
      return jsonError("Invalid payment date", 400);
    }

    const access = await requireBuyerInOwnedDairy(session, dairyIdNum, buyerIdNum);
    if (!access.ok) {
      return access.response;
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          dairyId: dairyIdNum,
          userId: buyerIdNum,
          amount: amountNum,
          type: "BUYER_PAYMENT",
          method,
          notes: typeof notes === "string" ? notes.trim() || null : null,
          date: paymentDate,
        },
      });

      const accountBalance = await tx.accountBalance.upsert({
        where: {
          dairyId_userId: {
            dairyId: dairyIdNum,
            userId: buyerIdNum,
          },
        },
        update: {
          currentBalance: { decrement: amountNum },
          lastPaymentId: payment.id,
        },
        create: {
          dairyId: dairyIdNum,
          userId: buyerIdNum,
          currentBalance: -amountNum,
          lastPaymentId: payment.id,
        },
      });

      return { payment, accountBalance };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to add buyer payment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { paymentId, dairyId, buyerId, amount, method = "CASH", notes, date } = body;

    const paymentIdNum = parsePositiveInt(paymentId);
    const dairyIdNum = parsePositiveInt(dairyId);
    const buyerIdNum = parsePositiveInt(buyerId);
    const amountNum = parsePositiveNumber(amount);

    if (!paymentIdNum || !dairyIdNum || !buyerIdNum || !amountNum) {
      return jsonError("Invalid paymentId, dairyId, buyerId or amount", 400);
    }

    if (!isPaymentMethod(method)) {
      return jsonError("Invalid payment method", 400);
    }

    const paymentDate = parseDateInput(date);
    if (!paymentDate) {
      return jsonError("Invalid payment date", 400);
    }

    const access = await requireBuyerInOwnedDairy(session, dairyIdNum, buyerIdNum);
    if (!access.ok) {
      return access.response;
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        id: paymentIdNum,
        dairyId: dairyIdNum,
        userId: buyerIdNum,
        type: "BUYER_PAYMENT",
      },
    });

    if (!existingPayment) {
      return jsonError("Payment not found", 404);
    }

    const amountDelta = amountNum - existingPayment.amount;

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: paymentIdNum },
        data: {
          amount: amountNum,
          method,
          notes: typeof notes === "string" ? notes.trim() || null : null,
          date: paymentDate,
        },
      });

      await tx.accountBalance.updateMany({
        where: {
          dairyId: dairyIdNum,
          userId: buyerIdNum,
        },
        data: {
          currentBalance: {
            decrement: amountDelta,
          },
        },
      });

      await syncLatestPayment(tx, dairyIdNum, buyerIdNum);

      return { payment };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Failed to update buyer payment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { paymentId, dairyId, buyerId } = body;

    const paymentIdNum = parsePositiveInt(paymentId);
    const dairyIdNum = parsePositiveInt(dairyId);
    const buyerIdNum = parsePositiveInt(buyerId);

    if (!paymentIdNum || !dairyIdNum || !buyerIdNum) {
      return jsonError("Invalid paymentId, dairyId or buyerId", 400);
    }

    const access = await requireBuyerInOwnedDairy(session, dairyIdNum, buyerIdNum);
    if (!access.ok) {
      return access.response;
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        id: paymentIdNum,
        dairyId: dairyIdNum,
        userId: buyerIdNum,
        type: "BUYER_PAYMENT",
      },
    });

    if (!existingPayment) {
      return jsonError("Payment not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.delete({
        where: { id: paymentIdNum },
      });

      await tx.accountBalance.updateMany({
        where: {
          dairyId: dairyIdNum,
          userId: buyerIdNum,
        },
        data: {
          currentBalance: {
            increment: existingPayment.amount,
          },
        },
      });

      await syncLatestPayment(tx, dairyIdNum, buyerIdNum);
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete buyer payment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
