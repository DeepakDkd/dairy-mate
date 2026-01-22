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

    
    const monthlyLitresAgg = await prisma.sellerEntry.aggregate({
      where: {
        dairyId,
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        litres: true,
      },
    });

    const totalMonthlyLitres = monthlyLitresAgg._sum.litres ?? 0;

    
    const todayLitresAgg = await prisma.sellerEntry.aggregate({
      where: {
        dairyId,
        date: {
          gte: startOfToday,
        },
      },
      _sum: {
        litres: true,
      },
    });

    const todaysMilkLitres = todayLitresAgg._sum.litres ?? 0;

    
    const monthlyEntries = await prisma.sellerEntry.findMany({
      where: {
        dairyId,
        date: {
          gte: startOfMonth,
        },
      },
      select: {
        litres: true,
        rate: true,
      },
    });

    const totalMonthlyExpense = monthlyEntries.reduce(
      (total, entry) => total + entry.litres * entry.rate,
      0
    );

    return NextResponse.json(
      {
        totalMonthlyLitres,
        todaysMilkLitres,
        totalMonthlyExpense,
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
