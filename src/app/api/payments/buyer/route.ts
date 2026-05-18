import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import {
  isPaymentMethod,
  jsonError,
  parseDateInput,
  parsePositiveInt,
  parsePositiveNumber,
  requirePartyAccess,
} from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const access = await requirePartyAccess(session, {
      dairyId: dairyIdNum,
      partyId: buyerIdNum,
      role: "BUYER",
    });
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
