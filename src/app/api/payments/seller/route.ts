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

    const access = await requirePartyAccess(session, {
      dairyId: dairyIdNum,
      partyId: sellerIdNum,
      role: "SELLER",
    });
    if (!access.ok) {
      return access.response;
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

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to add seller payment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
