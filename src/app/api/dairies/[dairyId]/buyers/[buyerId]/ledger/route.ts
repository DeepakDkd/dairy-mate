import { NextResponse } from "next/server";

import { jsonError, parsePositiveInt, requirePartyAccess } from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ dairyId: string; buyerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { dairyId: dairyIdParam, buyerId: buyerIdParam } = await context.params;
    const dairyId = parsePositiveInt(dairyIdParam);
    const buyerId = parsePositiveInt(buyerIdParam);

    if (!dairyId || !buyerId) {
      return jsonError("Invalid dairy or buyer ID", 400);
    }

    const access = await requirePartyAccess(session, {
      dairyId,
      partyId: buyerId,
      role: "BUYER",
    });
    if (!access.ok) {
      return access.response;
    }

    const buyer = access.data;

    const [entries, payments] = await Promise.all([
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
