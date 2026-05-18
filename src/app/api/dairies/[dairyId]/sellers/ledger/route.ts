import { NextResponse } from "next/server";

import { jsonError, parsePositiveInt, requireOwnedDairy } from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

type SellerLedgerItem = {
  id: string;
  date: Date;
  type: "MILK_ENTRY" | "PAYMENT";
  sellerName: string;
  paidAmount: number | null;
  totalAmount: number;
  balanceAfter: number;
  note: string;
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ dairyId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { dairyId: dairyIdParam } = await context.params;
    const dairyId = parsePositiveInt(dairyIdParam);

    if (!dairyId) {
      return jsonError("Invalid dairy ID", 400);
    }

    const access = await requireOwnedDairy(session, dairyId);
    if (!access.ok) {
      return access.response;
    }

    const [entries, payments] = await Promise.all([
      prisma.sellerEntry.findMany({
        where: { dairyId },
        include: {
          seller: {
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
          type: "SELLER_PAYMENT",
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
        sellerName: `${entry.seller.firstName} ${entry.seller.lastName}`,
        paidAmount: null,
        totalAmount: entry.totalAmount,
        delta: -entry.totalAmount,
        note: `${entry.shift} milk collection${entry.litres ? ` - ${entry.litres}L` : ""}`,
      })),
      ...payments.map((payment) => ({
        id: `payment-${payment.id}`,
        date: payment.date,
        type: "PAYMENT" as const,
        sellerName: `${payment.user.firstName} ${payment.user.lastName}`,
        paidAmount: payment.amount,
        totalAmount: payment.amount,
        delta: payment.amount,
        note: payment.notes || "Seller payment",
      })),
    ].sort((first, second) => first.date.getTime() - second.date.getTime());

    let runningBalance = 0;
    const ledger: SellerLedgerItem[] = merged.map((item) => {
      runningBalance += item.delta;
      return {
        id: item.id,
        date: item.date,
        type: item.type,
        sellerName: item.sellerName,
        paidAmount: item.paidAmount,
        totalAmount: item.totalAmount,
        balanceAfter: runningBalance,
        note: item.note,
      };
    });

    return NextResponse.json(
      { ledger: ledger.reverse(), currentBalance: runningBalance },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch seller ledger:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
