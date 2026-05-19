import { prisma } from "@/lib/db";
import { getMonthFromSearchParams, getMonthValue } from "@/utils/month";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ dairyId: string }> }
) {
  try {
    const { dairyId: dairyIdParam } = await context.params;
    const dairyId = Number(dairyIdParam);
    const { searchParams } = new URL(req.url);

    if (!dairyId || isNaN(dairyId)) {
      return NextResponse.json(
        { message: "Invalid dairy ID" },
        { status: 400 }
      );
    }

    const now = new Date();
    const selectedMonth = getMonthFromSearchParams(searchParams);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const isCurrentMonth = selectedMonth.value === getMonthValue(now);

    const [monthlyLitresAgg, monthlyAmountAgg, activeBuyers, balanceAgg, periodEntryCount, todayLitresAgg, entriesTodayCount] = await Promise.all([
      prisma.buyerEntry.aggregate({
        where: {
          dairyId,
          date: {
            gte: selectedMonth.start,
            lt: selectedMonth.end,
          },
        },
        _sum: { litres: true },
      }),
      prisma.buyerEntry.aggregate({
        where: {
          dairyId,
          date: {
            gte: selectedMonth.start,
            lt: selectedMonth.end,
          },
        },
        _sum: { totalAmount: true },
      }),
      prisma.user.count({
        where: {
          dairyId,
          role: "BUYER",
          isActive: true,
        },
      }),
      prisma.accountBalance.aggregate({
        where: {
          dairyId,
          user: {
            role: "BUYER",
          },
        },
        _sum: {
          currentBalance: true,
        },
      }),
      prisma.buyerEntry.count({
        where: {
          dairyId,
          date: {
            gte: selectedMonth.start,
            lt: selectedMonth.end,
          },
        },
      }),
      prisma.buyerEntry.aggregate({
        where: {
          dairyId,
          date: {
            gte: startOfToday,
          },
        },
        _sum: { litres: true },
      }),
      prisma.buyerEntry.count({
        where: {
          dairyId,
          date: {
            gte: startOfToday,
          },
        },
      }),
    ]);

    const totalMonthlyLitres = monthlyLitresAgg._sum.litres ?? 0;
    const totalMonthlyExpense = monthlyAmountAgg._sum.totalAmount ?? 0;
    const todaysMilkLitres = todayLitresAgg._sum.litres ?? 0;
    const buyerBalance = balanceAgg._sum.currentBalance ?? 0;

    return NextResponse.json(
      {
        totalMonthlyLitres,
        totalMonthlyExpense,
        activeBuyers,
        buyerBalance,
        todaysMilkLitres: isCurrentMonth ? todaysMilkLitres : 0,
        entriesTodayCount: isCurrentMonth ? entriesTodayCount : 0,
        periodEntryCount,
        selectedMonth: selectedMonth.value,
        monthLabel: selectedMonth.label,
        isCurrentMonth,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch buyer stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
