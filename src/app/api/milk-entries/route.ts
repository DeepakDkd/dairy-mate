import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();

    // Create milk entry
    const milkEntry = await prisma.sellerEntry.create({
      data: {
        ...body,
      },
    });

    // Update seller balance
    await prisma.accountBalance.update({
      where: {
        dairyId_userId: {
          dairyId: body.dairyId,
          userId: body.sellerId,
        },
      },
      data: {
        currentBalance: {
          increment: milkEntry.totalAmount,
        },
        lastEntryId: milkEntry.id,
      },
    });

    return NextResponse.json(milkEntry);

  } catch (error) {
    if (error) {
      return new NextResponse("Invalid request data", { status: 422 });
    }

    console.error(error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
