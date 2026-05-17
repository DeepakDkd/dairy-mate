import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ dairyId: string }> }
) {
  try {
    const { dairyId: dairyIdParam } = await context.params;
    const dairyId = Number(dairyIdParam);

    if (!dairyId || isNaN(dairyId)) {
      return NextResponse.json(
        { message: "Invalid dairy ID" },
        { status: 400 }
      );
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    
    const monthlyLitresAgg = await prisma.buyerEntry.aggregate({
      where: {
        dairyId,
        date: { gte: startOfMonth },
      },
      _sum: { litres: true },
    });

    const totalMonthlyLitres = monthlyLitresAgg._sum.litres ?? 0;

    
    const todayLitresAgg = await prisma.buyerEntry.aggregate({
      where: {
        dairyId,
        date: { gte: startOfToday },
      },
      _sum: { litres: true },
    });

    const todaysMilkLitres = todayLitresAgg._sum.litres ?? 0;

    
    const monthlyAmountAgg = await prisma.buyerEntry.aggregate({
      where: {
        dairyId,
        date: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    });

    const totalMonthlyExpense = monthlyAmountAgg._sum.totalAmount ?? 0;

    const [activeBuyers, balanceAgg, entriesTodayCount] = await Promise.all([
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
            gte: startOfToday,
          },
        },
      }),
    ]);

    const buyerBalance = balanceAgg._sum.currentBalance ?? 0;

    return NextResponse.json(
      {
        totalMonthlyLitres,
        todaysMilkLitres,
        totalMonthlyExpense,
        activeBuyers,
        buyerBalance,
        entriesTodayCount,
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
