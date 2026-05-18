import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ dairyId: string; buyerId: string }> }
) {
  try {
    const { dairyId: dairyIdParam, buyerId: buyerIdParam } = await context.params;
    const dairyId = Number(dairyIdParam);
    const buyerId = Number(buyerIdParam);

    if (!dairyId || !buyerId || Number.isNaN(dairyId) || Number.isNaN(buyerId)) {
      return NextResponse.json({ message: "Invalid dairy or buyer ID" }, { status: 400 });
    }

    const [buyer, entries, payments] = await Promise.all([
      prisma.user.findFirst({
        where: {
          id: buyerId,
          dairyId,
          role: "BUYER",
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      }),
      prisma.buyerEntry.findMany({
        where: {
          dairyId,
          buyerId,
        },
        orderBy: { date: "asc" },
      }),
      prisma.payment.findMany({
        where: {
          dairyId,
          userId: buyerId,
          type: "BUYER_PAYMENT",
        },
        orderBy: { date: "asc" },
      }),
    ]);

    if (!buyer) {
      return NextResponse.json({ message: "Buyer not found" }, { status: 404 });
    }

    const merged = [
      ...entries.map((entry) => ({
        id: `entry-${entry.id}`,
        date: entry.date,
        type: "MILK_ENTRY" as const,
        amount: entry.totalAmount,
        delta: entry.totalAmount,
        note: `${entry.shift} milk supply${entry.litres ? ` - ${entry.litres}L` : ""}`,
      })),
      ...payments.map((payment) => ({
        id: `payment-${payment.id}`,
        date: payment.date,
        type: "PAYMENT" as const,
        amount: payment.amount,
        delta: -payment.amount,
        note: payment.notes || "Buyer payment",
      })),
    ].sort((first, second) => first.date.getTime() - second.date.getTime());

    let runningBalance = 0;
    const ledger = merged.map((item) => {
      runningBalance += item.delta;
      return {
        id: item.id,
        date: item.date,
        type: item.type,
        amount: item.amount,
        balanceAfter: runningBalance,
        note: item.note,
      };
    });

    return NextResponse.json(
      {
        buyer: {
          id: buyer.id,
          name: `${buyer.firstName} ${buyer.lastName}`,
        },
        ledger: ledger.reverse(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch buyer personal ledger:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
