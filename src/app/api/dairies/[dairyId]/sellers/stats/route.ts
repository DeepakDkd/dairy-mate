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

    const [monthlyLitresAgg, monthlyAmountAgg, sellerCounts, balanceAgg, periodEntryCount, todayLitresAgg, entriesTodayCount] = await Promise.all([
      prisma.sellerEntry.aggregate({
        where: {
          dairyId,
          date: {
            gte: selectedMonth.start,
            lt: selectedMonth.end,
          },
        },
        _sum: {
          litres: true,
        },
      }),
      prisma.sellerEntry.aggregate({
        where: {
          dairyId,
          date: {
            gte: selectedMonth.start,
            lt: selectedMonth.end,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.user.count({
        where: {
          dairyId,
          role: "SELLER",
          isActive: true,
        },
      }),
      prisma.accountBalance.aggregate({
        where: {
          dairyId,
          user: {
            role: "SELLER",
          },
        },
        _sum: {
          currentBalance: true,
        },
      }),
      prisma.sellerEntry.count({
        where: {
          dairyId,
          date: {
            gte: selectedMonth.start,
            lt: selectedMonth.end,
          },
        },
      }),
      prisma.sellerEntry.aggregate({
        where: {
          dairyId,
          date: {
            gte: startOfToday,
          },
        },
        _sum: {
          litres: true,
        },
      }),
      prisma.sellerEntry.count({
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
    const sellerBalance = balanceAgg._sum.currentBalance ?? 0;

    return NextResponse.json(
      {
        totalMonthlyLitres,
        totalMonthlyExpense,
        activeSellers: sellerCounts,
        sellerBalance,
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
    console.error("Failed to fetch seller stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// import { prisma } from "@/lib/db";
// import { NextResponse } from "next/server";

// export async function GET(
//   req: Request,
//   context: { params: Promise<{ dairyId: string }> }
// ) {
//   try {
//     const params = await context.params;
//     const dairyId = Number(params.dairyId);
//     if (isNaN(dairyId)) {
//       return NextResponse.json(
//         { message: "Invalid dairy ID" },
//         { status: 400 }
//       );
//     }

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const startOfToday = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate()
//     );

//     const entries = await prisma.sellerEntry.findMany({
//       where: {
//         dairyId,
//         date: {
//           gte: startOfMonth,
//         },
//       },
//       select: {
//         litres: true,
//         rate: true,
//         date: true,
//       },
//     });

//     let totalMonthlyLitres = 0;
//     let todaysMilkLitres = 0;
//     let totalMonthlyExpense = 0;

//     for (const entry of entries) {
//       totalMonthlyLitres += entry.litres;
//       totalMonthlyExpense += entry.litres * entry.rate;

//       if (entry.date >= startOfToday) {
//         todaysMilkLitres += entry.litres;
//       }
//     }

//     return NextResponse.json(
//       {
//         totalMonthlyLitres,
//         todaysMilkLitres,
//         totalMonthlyExpense,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Failed to fetch seller stats", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
