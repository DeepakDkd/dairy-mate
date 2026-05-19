import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  isShift,
  jsonError,
  parseDateInput,
  parsePositiveInt,
  parsePositiveNumber,
  requirePartyAccess,
  requirePartyByIdAccess,
} from "@/lib/api-access";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function syncLatestBuyerEntry(tx: Pick<typeof prisma, "buyerEntry" | "accountBalance">, dairyId: number, buyerId: number) {
  const latestEntry = await tx.buyerEntry.findFirst({
    where: {
      dairyId,
      buyerId,
    },
    orderBy: [
      { date: "desc" },
      { id: "desc" },
    ],
    select: {
      id: true,
    },
  });

  await tx.accountBalance.updateMany({
    where: {
      dairyId,
      userId: buyerId,
    },
    data: {
      lastBuyerEntryId: latestEntry?.id ?? null,
    },
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ buyerId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const { buyerId: buyerIdParam } = await context.params;

    const buyerId = parsePositiveInt(buyerIdParam);
    if (!buyerId) {
      return jsonError("buyerId is required", 400);
    }

    const access = await requirePartyByIdAccess(session, {
      partyId: buyerId,
      role: "BUYER",
    });
    if (!access.ok) {
      return access.response;
    }

    const dateStr = searchParams.get("date") ??
      new Date().toISOString().split("T")[0];

    // start & end of the day
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const milkEntries = await prisma.buyerEntry.findMany({
      where: {
        buyerId,
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



export async function POST(
  request: Request,
  context: { params: Promise<{ buyerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("POST Body:", body);
    const { buyerId: buyerIdParam } = await context.params;
    const {
      dairyId,
      buyerId,
      litres,
      rate,
      totalAmount,
      shift,
      date,
    } = body;

    const routeBuyerId = parsePositiveInt(buyerIdParam);
    const dairyIdNum = parsePositiveInt(dairyId);
    const buyerIdNum = parsePositiveInt(buyerId);
    const litresNum = parsePositiveNumber(litres);
    const rateNum = parsePositiveNumber(rate);
    const totalAmountNum = parsePositiveNumber(totalAmount);
    const entryDate = parseDateInput(date);

    if (!routeBuyerId || !dairyIdNum || !buyerIdNum) {
      return jsonError("Invalid dairy or buyer ID", 400);
    }

    if (routeBuyerId !== buyerIdNum) {
      return jsonError("Route buyerId does not match request body", 400);
    }

    if (!litresNum || !rateNum || !totalAmountNum || !entryDate) {
      return jsonError("Invalid litres, rate, total amount, or date", 400);
    }

    if (!isShift(shift)) {
      return jsonError("Invalid shift", 400);
    }

    const access = await requirePartyAccess(session, {
      dairyId: dairyIdNum,
      partyId: buyerIdNum,
      role: "BUYER",
    });
    if (!access.ok) {
      return access.response;
    }

    const result = await prisma.$transaction(async (tx) => {
      const milkEntry = await tx.buyerEntry.create({
        data: {
          dairyId: dairyIdNum,
          buyerId: buyerIdNum,
          litres: litresNum,
          rate: rateNum,
          totalAmount: totalAmountNum,
          shift,
          date: entryDate,
        },
      });

      const accountBalance = await tx.accountBalance.upsert({
        where: {
          dairyId_userId: {
            dairyId: dairyIdNum,
            userId: buyerIdNum,
          },
        },
        update: {
          currentBalance: { increment: totalAmountNum },
          lastBuyerEntryId: milkEntry.id,
        },
        create: {
          dairyId: dairyIdNum,
          userId: buyerIdNum,
          currentBalance: totalAmountNum,
          lastBuyerEntryId: milkEntry.id,
        },
      });

      return { milkEntry, accountBalance };
    });
    return NextResponse.json(
      result,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ buyerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { buyerId: buyerIdParam } = await context.params;
    const {
      entryId,
      dairyId,
      buyerId,
      litres,
      rate,
      totalAmount,
      shift,
      date,
    } = body;

    const routeBuyerId = parsePositiveInt(buyerIdParam);
    const entryIdNum = parsePositiveInt(entryId);
    const dairyIdNum = parsePositiveInt(dairyId);
    const buyerIdNum = parsePositiveInt(buyerId);
    const litresNum = parsePositiveNumber(litres);
    const rateNum = parsePositiveNumber(rate);
    const totalAmountNum = parsePositiveNumber(totalAmount);
    const entryDate = parseDateInput(date);

    if (!routeBuyerId || !entryIdNum || !dairyIdNum || !buyerIdNum) {
      return jsonError("Invalid entry, dairy, or buyer ID", 400);
    }

    if (routeBuyerId !== buyerIdNum) {
      return jsonError("Route buyerId does not match request body", 400);
    }

    if (!litresNum || !rateNum || !totalAmountNum || !entryDate) {
      return jsonError("Invalid litres, rate, total amount, or date", 400);
    }

    if (!isShift(shift)) {
      return jsonError("Invalid shift", 400);
    }

    const access = await requirePartyAccess(session, {
      dairyId: dairyIdNum,
      partyId: buyerIdNum,
      role: "BUYER",
    });
    if (!access.ok) {
      return access.response;
    }

    const existingEntry = await prisma.buyerEntry.findFirst({
      where: {
        id: entryIdNum,
        dairyId: dairyIdNum,
        buyerId: buyerIdNum,
      },
    });

    if (!existingEntry) {
      return jsonError("Milk entry not found", 404);
    }

    const amountDelta = totalAmountNum - existingEntry.totalAmount;

    const result = await prisma.$transaction(async (tx) => {
      const milkEntry = await tx.buyerEntry.update({
        where: { id: entryIdNum },
        data: {
          litres: litresNum,
          rate: rateNum,
          totalAmount: totalAmountNum,
          shift,
          date: entryDate,
        },
      });

      await tx.accountBalance.updateMany({
        where: {
          dairyId: dairyIdNum,
          userId: buyerIdNum,
        },
        data: {
          currentBalance: {
            increment: amountDelta,
          },
        },
      });

      await syncLatestBuyerEntry(tx, dairyIdNum, buyerIdNum);

      return { milkEntry };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ buyerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { buyerId: buyerIdParam } = await context.params;
    const {
      entryId,
      dairyId,
      buyerId,
    } = body;

    const routeBuyerId = parsePositiveInt(buyerIdParam);
    const entryIdNum = parsePositiveInt(entryId);
    const dairyIdNum = parsePositiveInt(dairyId);
    const buyerIdNum = parsePositiveInt(buyerId);

    if (!routeBuyerId || !entryIdNum || !dairyIdNum || !buyerIdNum) {
      return jsonError("Invalid entry, dairy, or buyer ID", 400);
    }

    if (routeBuyerId !== buyerIdNum) {
      return jsonError("Route buyerId does not match request body", 400);
    }

    const access = await requirePartyAccess(session, {
      dairyId: dairyIdNum,
      partyId: buyerIdNum,
      role: "BUYER",
    });
    if (!access.ok) {
      return access.response;
    }

    const existingEntry = await prisma.buyerEntry.findFirst({
      where: {
        id: entryIdNum,
        dairyId: dairyIdNum,
        buyerId: buyerIdNum,
      },
    });

    if (!existingEntry) {
      return jsonError("Milk entry not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.buyerEntry.delete({
        where: { id: entryIdNum },
      });

      await tx.accountBalance.updateMany({
        where: {
          dairyId: dairyIdNum,
          userId: buyerIdNum,
        },
        data: {
          currentBalance: {
            decrement: existingEntry.totalAmount,
          },
        },
      });

      await syncLatestBuyerEntry(tx, dairyIdNum, buyerIdNum);
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
