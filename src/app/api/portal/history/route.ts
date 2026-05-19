import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-access";
import { getMonthFromSearchParams } from "@/utils/month";
import { getPagination } from "@/utils/pagination";

type HistoryItem = {
  id: string;
  date: Date;
  type: "MILK_ENTRY" | "PAYMENT";
  amount: number;
  balanceAfter: number;
  note: string;
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (session.user.role !== "BUYER" && session.user.role !== "SELLER") {
    return jsonError("Forbidden", 403);
  }

  try {
    const { searchParams } = new URL(req.url);
    const selectedMonth = getMonthFromSearchParams(searchParams);
    const { page, pageSize } = getPagination(searchParams);
    const isBuyer = session.user.role === "BUYER";

    const [entries, payments, entriesBeforeMonth, paymentsBeforeMonth] = await Promise.all([
      isBuyer
        ? prisma.buyerEntry.findMany({
            where: {
              buyerId: session.user.id,
              date: {
                gte: selectedMonth.start,
                lt: selectedMonth.end,
              },
            },
            orderBy: { date: "asc" },
          })
        : prisma.sellerEntry.findMany({
            where: {
              sellerId: session.user.id,
              date: {
                gte: selectedMonth.start,
                lt: selectedMonth.end,
              },
            },
            orderBy: { date: "asc" },
          }),
      prisma.payment.findMany({
        where: {
          userId: session.user.id,
          type: isBuyer ? "BUYER_PAYMENT" : "SELLER_PAYMENT",
          date: {
            gte: selectedMonth.start,
            lt: selectedMonth.end,
          },
        },
        orderBy: { date: "asc" },
      }),
      isBuyer
        ? prisma.buyerEntry.aggregate({
            where: {
              buyerId: session.user.id,
              date: {
                lt: selectedMonth.start,
              },
            },
            _sum: {
              totalAmount: true,
            },
          })
        : prisma.sellerEntry.aggregate({
            where: {
              sellerId: session.user.id,
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
          userId: session.user.id,
          type: isBuyer ? "BUYER_PAYMENT" : "SELLER_PAYMENT",
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
        delta: isBuyer ? entry.totalAmount : -entry.totalAmount,
        note: `${entry.shift} ${isBuyer ? "milk supply" : "milk collection"}${
          entry.litres ? ` - ${entry.litres}L` : ""
        }`,
      })),
      ...payments.map((payment) => ({
        id: `payment-${payment.id}`,
        date: payment.date,
        type: "PAYMENT" as const,
        amount: payment.amount,
        delta: isBuyer ? -payment.amount : payment.amount,
        note: payment.notes || `${isBuyer ? "Buyer" : "Seller"} payment`,
      })),
    ].sort((first, second) => first.date.getTime() - second.date.getTime());

    const openingBalance = isBuyer
      ? (entriesBeforeMonth._sum.totalAmount ?? 0) - (paymentsBeforeMonth._sum.amount ?? 0)
      : (paymentsBeforeMonth._sum.amount ?? 0) - (entriesBeforeMonth._sum.totalAmount ?? 0);

    let runningBalance = openingBalance;
    const ledger: HistoryItem[] = merged.map((item) => {
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
    const monthlyStats = {
      litres: entries.reduce((total, entry) => total + entry.litres, 0),
      amount: entries.reduce((total, entry) => total + entry.totalAmount, 0),
      entryCount: entries.length,
    };

    return NextResponse.json(
      {
        ledger: orderedLedger.slice(startIndex, startIndex + pageSize),
        monthlyStats,
        openingBalance,
        closingBalance: runningBalance,
        page: safePage,
        pageSize,
        totalItems,
        totalPages,
        selectedMonth: selectedMonth.value,
        monthLabel: selectedMonth.label,
        role: session.user.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch portal history:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
