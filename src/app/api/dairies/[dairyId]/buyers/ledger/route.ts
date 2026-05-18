import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type BuyerLedgerItem = {
  id: string;
  date: Date;
  type: "MILK_ENTRY" | "PAYMENT";
  buyerName: string;
  amount: number;
  balanceAfter: number;
  note: string;
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ dairyId: string }> }
) {
  try {
    const { dairyId: dairyIdParam } = await context.params;
    const dairyId = Number(dairyIdParam);

    if (!dairyId || Number.isNaN(dairyId)) {
      return NextResponse.json({ message: "Invalid dairy ID" }, { status: 400 });
    }

    const [entries, payments] = await Promise.all([
      prisma.buyerEntry.findMany({
        where: { dairyId },
        include: {
          buyer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { date: "asc" },
      }),
      prisma.payment.findMany({
        where: {
          dairyId,
          type: "BUYER_PAYMENT",
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { date: "asc" },
      }),
    ]);

    const merged = [
      ...entries.map((entry) => ({
        id: `entry-${entry.id}`,
        date: entry.date,
        type: "MILK_ENTRY" as const,
        buyerName: `${entry.buyer.firstName} ${entry.buyer.lastName}`,
        amount: entry.totalAmount,
        delta: entry.totalAmount,
        note: `${entry.shift} milk supply${entry.litres ? ` - ${entry.litres}L` : ""}`,
      })),
      ...payments.map((payment) => ({
        id: `payment-${payment.id}`,
        date: payment.date,
        type: "PAYMENT" as const,
        buyerName: `${payment.user.firstName} ${payment.user.lastName}`,
        amount: payment.amount,
        delta: -payment.amount,
        note: payment.notes || "Buyer payment",
      })),
    ].sort((first, second) => first.date.getTime() - second.date.getTime());

    let runningBalance = 0;
    const ledger: BuyerLedgerItem[] = merged.map((item) => {
      runningBalance += item.delta;
      return {
        id: item.id,
        date: item.date,
        type: item.type,
        buyerName: item.buyerName,
        amount: item.amount,
        balanceAfter: runningBalance,
        note: item.note,
      };
    });

    return NextResponse.json(
      { ledger: ledger.reverse(), currentBalance: runningBalance },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch buyer ledger:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
