import { NextResponse } from "next/server";

import { jsonError, parsePositiveInt, requirePartyAccess } from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMonthFromSearchParams } from "@/utils/month";
import { getPagination } from "@/utils/pagination";
import { getServerSession } from "next-auth";

export async function GET(
  req: Request,
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
    const { searchParams } = new URL(req.url);

    if (!dairyId || !buyerId) {
      return jsonError("Invalid dairy or buyer ID", 400);
    }

    const selectedMonth = getMonthFromSearchParams(searchParams);
    const { page, pageSize } = getPagination(searchParams);

    const access = await requirePartyAccess(session, {
      dairyId,
      partyId: buyerId,
      role: "BUYER",
    });
    if (!access.ok) {
      return access.response;
    }

    const buyer = access.data;

    const [entries, payments, entriesBeforeMonth, paymentsBeforeMonth] = await Promise.all([
      prisma.buyerEntry.findMany({
        where: {
          dairyId,
          buyerId,
          date: {
            gte: selectedMonth.start,
            lt: selectedMonth.end,
          },
        },
        orderBy: { date: "asc" },
      }),
      prisma.payment.findMany({
        where: {
          dairyId,
          userId: buyerId,
          type: "BUYER_PAYMENT",
          date: {
            gte: selectedMonth.start,
            lt: selectedMonth.end,
          },
        },
        orderBy: { date: "asc" },
      }),
      prisma.buyerEntry.aggregate({
        where: {
          dairyId,
          buyerId,
          date: {
            lt: selectedMonth.start,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.payment.aggregate({
        where: {
          dairyId,
          userId: buyerId,
          type: "BUYER_PAYMENT",
          date: {
            lt: selectedMonth.start,
          },
        },
        _sum: {
          amount: true,
        },
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

    const openingBalance =
      (entriesBeforeMonth._sum.totalAmount ?? 0) - (paymentsBeforeMonth._sum.amount ?? 0);

    let runningBalance = openingBalance;
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
    const orderedLedger = ledger.reverse();
    const totalItems = orderedLedger.length;
    const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginatedLedger = orderedLedger.slice(startIndex, startIndex + pageSize);

    return NextResponse.json(
      {
        buyer: {
          id: buyer.id,
          name: `${buyer.firstName} ${buyer.lastName}`,
        },
        ledger: paginatedLedger,
        openingBalance,
        closingBalance: runningBalance,
        page: safePage,
        pageSize,
        totalItems,
        totalPages,
        selectedMonth: selectedMonth.value,
        monthLabel: selectedMonth.label,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch buyer personal ledger:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
