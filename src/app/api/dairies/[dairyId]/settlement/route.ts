import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { buildMonthSettlementSnapshot, getMonthSettlementStatus } from "@/lib/month-settlements";
import prisma from "@/lib/prisma";
import { jsonError, parsePositiveInt, requireOwnedDairy } from "@/lib/api-access";
import { parseMonthValue } from "@/utils/month";

export async function GET(
  request: Request,
  context: { params: Promise<{ dairyId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { dairyId: dairyIdParam } = await context.params;
    const dairyId = parsePositiveInt(dairyIdParam);
    const { searchParams } = new URL(request.url);

    if (!dairyId) {
      return jsonError("Invalid dairy ID", 400);
    }

    const access = await requireOwnedDairy(session, dairyId);
    if (!access.ok) {
      return access.response;
    }

    const snapshot = await buildMonthSettlementSnapshot(prisma, dairyId, searchParams.get("month"));
    const status = await getMonthSettlementStatus(prisma, dairyId, snapshot.selectedMonth.value);

    return NextResponse.json(
      {
        selectedMonth: snapshot.selectedMonth.value,
        monthLabel: snapshot.selectedMonth.label,
        isClosed: status.isClosed,
        settlement: status.settlement,
        snapshot: {
          monthlyBuyerAmount: snapshot.monthlyBuyerAmount,
          monthlySellerAmount: snapshot.monthlySellerAmount,
          buyerClosingBalance: snapshot.buyerClosingBalance,
          sellerClosingBalance: snapshot.sellerClosingBalance,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch month settlement:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ dairyId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { dairyId: dairyIdParam } = await context.params;
    const dairyId = parsePositiveInt(dairyIdParam);
    const body = await request.json();
    const monthValue = typeof body?.month === "string" ? body.month : null;
    const notes = typeof body?.notes === "string" ? body.notes.trim() || null : null;

    if (!dairyId) {
      return jsonError("Invalid dairy ID", 400);
    }

    const access = await requireOwnedDairy(session, dairyId);
    if (!access.ok) {
      return access.response;
    }

    const snapshot = await buildMonthSettlementSnapshot(prisma, dairyId, monthValue);
    const status = await getMonthSettlementStatus(prisma, dairyId, snapshot.selectedMonth.value);

    if (status.isClosed) {
      return jsonError(`${snapshot.selectedMonth.label} is already closed`, 409);
    }

    const settlement = await prisma.monthlySettlement.upsert({
      where: {
        dairyId_monthStart: {
          dairyId,
          monthStart: snapshot.selectedMonth.start,
        },
      },
      update: {
        monthKey: snapshot.selectedMonth.value,
        isClosed: true,
        closedAt: new Date(),
        reopenedAt: null,
        closedByUserId: session.user.id,
        notes,
        monthlyBuyerAmount: snapshot.monthlyBuyerAmount,
        monthlySellerAmount: snapshot.monthlySellerAmount,
        buyerClosingBalance: snapshot.buyerClosingBalance,
        sellerClosingBalance: snapshot.sellerClosingBalance,
      },
      create: {
        dairyId,
        monthStart: snapshot.selectedMonth.start,
        monthKey: snapshot.selectedMonth.value,
        isClosed: true,
        closedAt: new Date(),
        closedByUserId: session.user.id,
        notes,
        monthlyBuyerAmount: snapshot.monthlyBuyerAmount,
        monthlySellerAmount: snapshot.monthlySellerAmount,
        buyerClosingBalance: snapshot.buyerClosingBalance,
        sellerClosingBalance: snapshot.sellerClosingBalance,
      },
    });

    return NextResponse.json(
      {
        selectedMonth: snapshot.selectedMonth.value,
        monthLabel: snapshot.selectedMonth.label,
        isClosed: true,
        settlement,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to close month:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ dairyId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { dairyId: dairyIdParam } = await context.params;
    const dairyId = parsePositiveInt(dairyIdParam);
    const { searchParams } = new URL(request.url);
    const selectedMonth = parseMonthValue(searchParams.get("month"));

    if (!dairyId) {
      return jsonError("Invalid dairy ID", 400);
    }

    const access = await requireOwnedDairy(session, dairyId);
    if (!access.ok) {
      return access.response;
    }

    const status = await getMonthSettlementStatus(prisma, dairyId, selectedMonth.value);
    if (!status.settlement || !status.isClosed) {
      return jsonError(`${selectedMonth.label} is not closed`, 404);
    }

    const settlement = await prisma.monthlySettlement.update({
      where: {
        dairyId_monthStart: {
          dairyId,
          monthStart: selectedMonth.start,
        },
      },
      data: {
        isClosed: false,
        reopenedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        selectedMonth: selectedMonth.value,
        monthLabel: selectedMonth.label,
        isClosed: false,
        settlement,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to reopen month:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
