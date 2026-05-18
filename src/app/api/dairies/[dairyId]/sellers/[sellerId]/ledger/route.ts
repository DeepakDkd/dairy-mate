import { NextResponse } from "next/server";

import { jsonError, parsePositiveInt, requirePartyAccess } from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ dairyId: string; sellerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { dairyId: dairyIdParam, sellerId: sellerIdParam } = await context.params;
    const dairyId = parsePositiveInt(dairyIdParam);
    const sellerId = parsePositiveInt(sellerIdParam);

    if (!dairyId || !sellerId) {
      return jsonError("Invalid dairy or seller ID", 400);
    }

    const access = await requirePartyAccess(session, {
      dairyId,
      partyId: sellerId,
      role: "SELLER",
    });
    if (!access.ok) {
      return access.response;
    }

    const seller = access.data;

    const [entries, payments] = await Promise.all([
      prisma.sellerEntry.findMany({
        where: {
          dairyId,
          sellerId,
        },
        orderBy: { date: "asc" },
      }),
      prisma.payment.findMany({
        where: {
          dairyId,
          userId: sellerId,
          type: "SELLER_PAYMENT",
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
        delta: -entry.totalAmount,
        note: `${entry.shift} milk collection${entry.litres ? ` - ${entry.litres}L` : ""}`,
      })),
      ...payments.map((payment) => ({
        id: `payment-${payment.id}`,
        date: payment.date,
        type: "PAYMENT" as const,
        amount: payment.amount,
        delta: payment.amount,
        note: payment.notes || "Seller payment",
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
        seller: {
          id: seller.id,
          name: `${seller.firstName} ${seller.lastName}`,
        },
        ledger: ledger.reverse(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch seller personal ledger:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
