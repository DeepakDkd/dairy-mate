import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  isMilkType,
  isShift,
  jsonError,
  parseDateInput,
  parseNonNegativeNumber,
  parsePositiveInt,
  parsePositiveNumber,
  requirePartyAccess,
  requirePartyByIdAccess,
} from "@/lib/api-access";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function syncLatestSellerEntry(tx: Pick<typeof prisma, "sellerEntry" | "accountBalance">, dairyId: number, sellerId: number) {
  const latestEntry = await tx.sellerEntry.findFirst({
    where: {
      dairyId,
      sellerId,
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
      userId: sellerId,
    },
    data: {
      lastSellerEntryId: latestEntry?.id ?? null,
    },
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ sellerId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const { sellerId: sellerIdParam } = await context.params;

    const sellerId = parsePositiveInt(sellerIdParam);
    if (!sellerId) {
      return jsonError("sellerId is required", 400);
    }

    const access = await requirePartyByIdAccess(session, {
      partyId: sellerId,
      role: "SELLER",
    });
    if (!access.ok) {
      return access.response;
    }

    const dateStr = searchParams.get("date") ??
      new Date().toISOString().split("T")[0];

    // start & end of the day
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const milkEntries = await prisma.sellerEntry.findMany({
      where: {
        sellerId: sellerId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        seller: {
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
  context: { params: Promise<{ sellerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { sellerId: sellerIdParam } = await context.params;

    const {
      dairyId,
      sellerId,
      fat,
      lr,
      litres,
      milkType,
      rate,
      totalAmount,
      shift,
      date,
    } = body;

    const routeSellerId = parsePositiveInt(sellerIdParam);
    const dairyIdNum = parsePositiveInt(dairyId);
    const sellerIdNum = parsePositiveInt(sellerId);
    const fatNum = fat == null ? null : parseNonNegativeNumber(fat);
    const lrNum = lr == null ? null : parseNonNegativeNumber(lr);
    const litresNum = parsePositiveNumber(litres);
    const rateNum = parsePositiveNumber(rate);
    const totalAmountNum = parsePositiveNumber(totalAmount);
    const entryDate = parseDateInput(date);

    if (!routeSellerId || !dairyIdNum || !sellerIdNum) {
      return jsonError("Invalid dairy or seller ID", 400);
    }

    if (routeSellerId !== sellerIdNum) {
      return jsonError("Route sellerId does not match request body", 400);
    }

    if (!litresNum || !rateNum || !totalAmountNum || !entryDate) {
      return jsonError("Invalid litres, rate, total amount, or date", 400);
    }

    if (!isShift(shift) || !isMilkType(milkType)) {
      return jsonError("Invalid shift or milk type", 400);
    }

    if (fat != null && fatNum == null) {
      return jsonError("Invalid fat value", 400);
    }

    if (lr != null && lrNum == null) {
      return jsonError("Invalid LR value", 400);
    }

    const access = await requirePartyAccess(session, {
      dairyId: dairyIdNum,
      partyId: sellerIdNum,
      role: "SELLER",
    });
    if (!access.ok) {
      return access.response;
    }

    const result = await prisma.$transaction(async (tx) => {
      const milkEntry = await tx.sellerEntry.create({
        data: {
          dairyId: dairyIdNum,
          sellerId: sellerIdNum,
          fat: fatNum,
          lr: lrNum,
          litres: litresNum,
          milkType,
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
            userId: sellerIdNum,
          },
        },
        update: {
          currentBalance: { decrement: totalAmountNum },
          lastSellerEntryId: milkEntry.id,
        },
        create: {
          dairyId: dairyIdNum,
          userId: sellerIdNum,
          currentBalance: -totalAmountNum,
          lastSellerEntryId: milkEntry.id,
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
  context: { params: Promise<{ sellerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { sellerId: sellerIdParam } = await context.params;
    const {
      entryId,
      dairyId,
      sellerId,
      fat,
      lr,
      litres,
      milkType,
      rate,
      totalAmount,
      shift,
      date,
    } = body;

    const routeSellerId = parsePositiveInt(sellerIdParam);
    const entryIdNum = parsePositiveInt(entryId);
    const dairyIdNum = parsePositiveInt(dairyId);
    const sellerIdNum = parsePositiveInt(sellerId);
    const fatNum = fat == null ? null : parseNonNegativeNumber(fat);
    const lrNum = lr == null ? null : parseNonNegativeNumber(lr);
    const litresNum = parsePositiveNumber(litres);
    const rateNum = parsePositiveNumber(rate);
    const totalAmountNum = parsePositiveNumber(totalAmount);
    const entryDate = parseDateInput(date);

    if (!routeSellerId || !entryIdNum || !dairyIdNum || !sellerIdNum) {
      return jsonError("Invalid entry, dairy, or seller ID", 400);
    }

    if (routeSellerId !== sellerIdNum) {
      return jsonError("Route sellerId does not match request body", 400);
    }

    if (!litresNum || !rateNum || !totalAmountNum || !entryDate) {
      return jsonError("Invalid litres, rate, total amount, or date", 400);
    }

    if (!isShift(shift) || !isMilkType(milkType)) {
      return jsonError("Invalid shift or milk type", 400);
    }

    if (fat != null && fatNum == null) {
      return jsonError("Invalid fat value", 400);
    }

    if (lr != null && lrNum == null) {
      return jsonError("Invalid LR value", 400);
    }

    const access = await requirePartyAccess(session, {
      dairyId: dairyIdNum,
      partyId: sellerIdNum,
      role: "SELLER",
    });
    if (!access.ok) {
      return access.response;
    }

    const existingEntry = await prisma.sellerEntry.findFirst({
      where: {
        id: entryIdNum,
        dairyId: dairyIdNum,
        sellerId: sellerIdNum,
      },
    });

    if (!existingEntry) {
      return jsonError("Milk entry not found", 404);
    }

    const amountDelta = totalAmountNum - existingEntry.totalAmount;

    const result = await prisma.$transaction(async (tx) => {
      const milkEntry = await tx.sellerEntry.update({
        where: { id: entryIdNum },
        data: {
          fat: fatNum,
          lr: lrNum,
          litres: litresNum,
          milkType,
          rate: rateNum,
          totalAmount: totalAmountNum,
          shift,
          date: entryDate,
        },
      });

      await tx.accountBalance.updateMany({
        where: {
          dairyId: dairyIdNum,
          userId: sellerIdNum,
        },
        data: {
          currentBalance: {
            decrement: amountDelta,
          },
        },
      });

      await syncLatestSellerEntry(tx, dairyIdNum, sellerIdNum);

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
  context: { params: Promise<{ sellerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { sellerId: sellerIdParam } = await context.params;
    const {
      entryId,
      dairyId,
      sellerId,
    } = body;

    const routeSellerId = parsePositiveInt(sellerIdParam);
    const entryIdNum = parsePositiveInt(entryId);
    const dairyIdNum = parsePositiveInt(dairyId);
    const sellerIdNum = parsePositiveInt(sellerId);

    if (!routeSellerId || !entryIdNum || !dairyIdNum || !sellerIdNum) {
      return jsonError("Invalid entry, dairy, or seller ID", 400);
    }

    if (routeSellerId !== sellerIdNum) {
      return jsonError("Route sellerId does not match request body", 400);
    }

    const access = await requirePartyAccess(session, {
      dairyId: dairyIdNum,
      partyId: sellerIdNum,
      role: "SELLER",
    });
    if (!access.ok) {
      return access.response;
    }

    const existingEntry = await prisma.sellerEntry.findFirst({
      where: {
        id: entryIdNum,
        dairyId: dairyIdNum,
        sellerId: sellerIdNum,
      },
    });

    if (!existingEntry) {
      return jsonError("Milk entry not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.sellerEntry.delete({
        where: { id: entryIdNum },
      });

      await tx.accountBalance.updateMany({
        where: {
          dairyId: dairyIdNum,
          userId: sellerIdNum,
        },
        data: {
          currentBalance: {
            increment: existingEntry.totalAmount,
          },
        },
      });

      await syncLatestSellerEntry(tx, dairyIdNum, sellerIdNum);
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
