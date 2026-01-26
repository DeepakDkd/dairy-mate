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

    
    const monthlyEntries = await prisma.buyerEntry.findMany({
      where: {
        dairyId,
        date: { gte: startOfMonth },
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
    console.error("Failed to fetch buyer stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
