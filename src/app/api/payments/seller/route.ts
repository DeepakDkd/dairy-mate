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
import { findClosedSettlementForDates, getMonthLockedMessage } from "@/lib/month-settlements";
import { createUserNotification } from "@/lib/notifications";
import prisma from "@/lib/prisma";

async function syncLatestPayment(tx: Pick<typeof prisma, "payment" | "accountBalance">, dairyId: number, sellerId: number) {
  const latestPayment = await tx.payment.findFirst({
    where: {
      dairyId,
      userId: sellerId,
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
      userId: sellerId,
    },
    data: {
      lastPaymentId: latestPayment?.id ?? null,
    },
  });
}

async function requireSellerInOwnedDairy(
  session: Session,
  dairyId: number,
  sellerId: number
) {
  const dairyAccess = await requireOwnedDairy(session, dairyId);
  if (!dairyAccess.ok) {
    return dairyAccess;
  }

  const seller = await prisma.user.findFirst({
    where: {
      id: sellerId,
      dairyId,
      role: "SELLER",
    },
    select: {
      id: true,
    },
  });

  if (!seller) {
    return { ok: false as const, response: jsonError("Seller not found", 404) };
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
    const { dairyId, sellerId, amount, method = "CASH", notes, date } = body;

    const dairyIdNum = parsePositiveInt(dairyId);
    const sellerIdNum = parsePositiveInt(sellerId);
    const amountNum = parsePositiveNumber(amount);

    if (!dairyIdNum || !sellerIdNum || !amountNum) {
      return jsonError("Invalid dairyId, sellerId or amount", 400);
    }

    if (!isPaymentMethod(method)) {
      return jsonError("Invalid payment method", 400);
    }

    const paymentDate = parseDateInput(date);
    if (!paymentDate) {
      return jsonError("Invalid payment date", 400);
    }

    const access = await requireSellerInOwnedDairy(session, dairyIdNum, sellerIdNum);
    if (!access.ok) {
      return access.response;
    }

    const closedSettlement = await findClosedSettlementForDates(prisma, dairyIdNum, [paymentDate]);
    if (closedSettlement) {
      return jsonError(getMonthLockedMessage(closedSettlement.selectedMonth.label), 409);
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          dairyId: dairyIdNum,
          userId: sellerIdNum,
          amount: amountNum,
          type: "SELLER_PAYMENT",
          method,
          notes: typeof notes === "string" ? notes.trim() || null : null,
          date: paymentDate,
        },
      });

      const accountBalance = await tx.accountBalance.upsert({
        where: {
          dairyId_userId: {
            dairyId: dairyIdNum,
            userId: sellerIdNum,
          },
        },
        update: {
          currentBalance: { increment: amountNum },
          lastPaymentId: payment.id,
        },
        create: {
          dairyId: dairyIdNum,
          userId: sellerIdNum,
          currentBalance: amountNum,
          lastPaymentId: payment.id,
        },
      });

      return { payment, accountBalance };
    });

    try {
      await createUserNotification({
        dairyId: dairyIdNum,
        createdByUserId: session.user.id,
        userId: sellerIdNum,
        type: "PAYMENT_SENT",
        title: "Payment recorded",
        message: `A payment of Rs ${amountNum.toLocaleString("en-IN")} has been recorded in your account.`,
        actionUrl: "/portal/seller",
      });
    } catch (notificationError) {
      console.error("Failed to create seller payment notification:", notificationError);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to add seller payment:", error);
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
    const { paymentId, dairyId, sellerId, amount, method = "CASH", notes, date } = body;

    const paymentIdNum = parsePositiveInt(paymentId);
    const dairyIdNum = parsePositiveInt(dairyId);
    const sellerIdNum = parsePositiveInt(sellerId);
    const amountNum = parsePositiveNumber(amount);

    if (!paymentIdNum || !dairyIdNum || !sellerIdNum || !amountNum) {
      return jsonError("Invalid paymentId, dairyId, sellerId or amount", 400);
    }

    if (!isPaymentMethod(method)) {
      return jsonError("Invalid payment method", 400);
    }

    const paymentDate = parseDateInput(date);
    if (!paymentDate) {
      return jsonError("Invalid payment date", 400);
    }

    const access = await requireSellerInOwnedDairy(session, dairyIdNum, sellerIdNum);
    if (!access.ok) {
      return access.response;
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        id: paymentIdNum,
        dairyId: dairyIdNum,
        userId: sellerIdNum,
        type: "SELLER_PAYMENT",
      },
    });

    if (!existingPayment) {
      return jsonError("Payment not found", 404);
    }

    const closedSettlement = await findClosedSettlementForDates(prisma, dairyIdNum, [
      existingPayment.date,
      paymentDate,
    ]);
    if (closedSettlement) {
      return jsonError(getMonthLockedMessage(closedSettlement.selectedMonth.label), 409);
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
          userId: sellerIdNum,
        },
        data: {
          currentBalance: {
            increment: amountDelta,
          },
        },
      });

      await syncLatestPayment(tx, dairyIdNum, sellerIdNum);

      return { payment };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Failed to update seller payment:", error);
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
    const { paymentId, dairyId, sellerId } = body;

    const paymentIdNum = parsePositiveInt(paymentId);
    const dairyIdNum = parsePositiveInt(dairyId);
    const sellerIdNum = parsePositiveInt(sellerId);

    if (!paymentIdNum || !dairyIdNum || !sellerIdNum) {
      return jsonError("Invalid paymentId, dairyId or sellerId", 400);
    }

    const access = await requireSellerInOwnedDairy(session, dairyIdNum, sellerIdNum);
    if (!access.ok) {
      return access.response;
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        id: paymentIdNum,
        dairyId: dairyIdNum,
        userId: sellerIdNum,
        type: "SELLER_PAYMENT",
      },
    });

    if (!existingPayment) {
      return jsonError("Payment not found", 404);
    }

    const closedSettlement = await findClosedSettlementForDates(prisma, dairyIdNum, [
      existingPayment.date,
    ]);
    if (closedSettlement) {
      return jsonError(getMonthLockedMessage(closedSettlement.selectedMonth.label), 409);
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.delete({
        where: { id: paymentIdNum },
      });

      await tx.accountBalance.updateMany({
        where: {
          dairyId: dairyIdNum,
          userId: sellerIdNum,
        },
        data: {
          currentBalance: {
            decrement: existingPayment.amount,
          },
        },
      });

      await syncLatestPayment(tx, dairyIdNum, sellerIdNum);
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete seller payment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
