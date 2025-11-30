import prisma from "@/app/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    const sellerId = Number(searchParams.get("sellerId"));
    if (!sellerId) {
      return new NextResponse("sellerId is required", { status: 400 });
    }

    const dateStr = searchParams.get("date") ??
      new Date().toISOString().split("T")[0];

    // start & end of the day
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const milkEntries = await prisma.buyerEntry.findMany({
      where: {
        buyerId: sellerId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        buyer: {
          select: {
            firstName: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(milkEntries);

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal error", { status: 500 });
  }
}



export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("POST Body:", body);
    const {
      dairyId,
      buyerId,
      litres,
      rate,
      totalAmount,
      shift,
      date,
    } = body;

    // Create milk entry
    const milkEntry = await prisma.buyerEntry.create({
      data: {
        dairyId,
        buyerId,
        litres,
        rate,
        totalAmount,
        shift,
        date: new Date(date),
      },
    });

    // Update or Create accountBalance using UPSERT
    const accountBalance = await prisma.accountBalance.upsert({
      where: {
        dairyId_userId: {
          dairyId,
          userId: buyerId,
        },
      },
      update: {
        currentBalance: { increment: totalAmount },
        lastEntryId: milkEntry.id,
      },
      create: {
        dairyId,
        userId: buyerId,
        currentBalance: totalAmount,
        lastEntryId: milkEntry.id,
      },
    });
    return NextResponse.json(
      { milkEntry, accountBalance },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}