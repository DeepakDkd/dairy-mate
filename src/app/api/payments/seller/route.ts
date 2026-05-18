import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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

    const dairyIdNum = Number(dairyId);
    const sellerIdNum = Number(sellerId);
    const amountNum = Number(amount);

    if (!dairyIdNum || !sellerIdNum || !amountNum || amountNum <= 0) {
      return NextResponse.json(
        { message: "Invalid dairyId, sellerId or amount" },
        { status: 400 }
      );
    }

    const paymentDate = date ? new Date(date) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          dairyId: dairyIdNum,
          userId: sellerIdNum,
          amount: amountNum,
          type: "SELLER_PAYMENT",
          method,
          notes,
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
