import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { buildCsv } from "@/lib/csv";
import { jsonError, parsePositiveInt, requireOwnedDairy } from "@/lib/api-access";
import prisma from "@/lib/prisma";
import { getMonthFromSearchParams } from "@/utils/month";

type ExportReport =
  | "buyer-ledger"
  | "buyer-entries"
  | "seller-ledger"
  | "seller-entries";

function isExportReport(value: string | null): value is ExportReport {
  return (
    value === "buyer-ledger" ||
    value === "buyer-entries" ||
    value === "seller-ledger" ||
    value === "seller-entries"
  );
}

function createCsvResponse(filename: string, csv: string) {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

async function buildBuyerLedgerCsv(dairyId: number, monthStart: Date, monthEnd: Date) {
  const [entries, payments, entriesBeforeMonth, paymentsBeforeMonth] = await Promise.all([
    prisma.buyerEntry.findMany({
      where: {
        dairyId,
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      include: {
        buyer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { id: "asc" }],
    }),
    prisma.payment.findMany({
      where: {
        dairyId,
        type: "BUYER_PAYMENT",
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { id: "asc" }],
    }),
    prisma.buyerEntry.aggregate({
      where: {
        dairyId,
        date: {
          lt: monthStart,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.payment.aggregate({
      where: {
        dairyId,
        type: "BUYER_PAYMENT",
        date: {
          lt: monthStart,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const openingBalance =
    (entriesBeforeMonth._sum.totalAmount ?? 0) - (paymentsBeforeMonth._sum.amount ?? 0);

  const merged = [
    ...entries.map((entry) => ({
      date: entry.date,
      name: `${entry.buyer.firstName} ${entry.buyer.lastName}`,
      type: "Milk Entry",
      method: "",
      amount: entry.totalAmount,
      delta: entry.totalAmount,
      note: `${entry.shift} milk supply${entry.litres ? ` - ${entry.litres}L` : ""}`,
    })),
    ...payments.map((payment) => ({
      date: payment.date,
      name: `${payment.user.firstName} ${payment.user.lastName}`,
      type: "Payment",
      method: payment.method,
      amount: payment.amount,
      delta: -payment.amount,
      note: payment.notes || "Buyer payment",
    })),
  ].sort((first, second) => first.date.getTime() - second.date.getTime());

  let runningBalance = openingBalance;
  const rows = merged.map((item) => {
    runningBalance += item.delta;

    return [
      item.date,
      item.name,
      item.type,
      item.method,
      item.amount,
      runningBalance,
      item.note,
    ];
  });

  return buildCsv(
    ["Date", "Buyer", "Type", "Method", "Amount (Rs)", "Balance After (Rs)", "Note"],
    rows
  );
}

async function buildBuyerEntriesCsv(dairyId: number, monthStart: Date, monthEnd: Date) {
  const entries = await prisma.buyerEntry.findMany({
    where: {
      dairyId,
      date: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
    include: {
      buyer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });

  return buildCsv(
    ["Date", "Buyer", "Shift", "Litres", "Rate (Rs/L)", "Total Amount (Rs)"],
    entries.map((entry) => [
      entry.date,
      `${entry.buyer.firstName} ${entry.buyer.lastName}`,
      entry.shift,
      entry.litres,
      entry.rate,
      entry.totalAmount,
    ])
  );
}

async function buildSellerLedgerCsv(dairyId: number, monthStart: Date, monthEnd: Date) {
  const [entries, payments, entriesBeforeMonth, paymentsBeforeMonth] = await Promise.all([
    prisma.sellerEntry.findMany({
      where: {
        dairyId,
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      include: {
        seller: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { id: "asc" }],
    }),
    prisma.payment.findMany({
      where: {
        dairyId,
        type: "SELLER_PAYMENT",
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { id: "asc" }],
    }),
    prisma.sellerEntry.aggregate({
      where: {
        dairyId,
        date: {
          lt: monthStart,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.payment.aggregate({
      where: {
        dairyId,
        type: "SELLER_PAYMENT",
        date: {
          lt: monthStart,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const openingBalance =
    (paymentsBeforeMonth._sum.amount ?? 0) - (entriesBeforeMonth._sum.totalAmount ?? 0);

  const merged = [
    ...entries.map((entry) => ({
      date: entry.date,
      name: `${entry.seller.firstName} ${entry.seller.lastName}`,
      type: "Milk Entry",
      method: "",
      paidAmount: "",
      totalAmount: entry.totalAmount,
      delta: -entry.totalAmount,
      note: `${entry.shift} milk collection${entry.litres ? ` - ${entry.litres}L` : ""}`,
    })),
    ...payments.map((payment) => ({
      date: payment.date,
      name: `${payment.user.firstName} ${payment.user.lastName}`,
      type: "Payment",
      method: payment.method,
      paidAmount: payment.amount,
      totalAmount: payment.amount,
      delta: payment.amount,
      note: payment.notes || "Seller payment",
    })),
  ].sort((first, second) => first.date.getTime() - second.date.getTime());

  let runningBalance = openingBalance;
  const rows = merged.map((item) => {
    runningBalance += item.delta;

    return [
      item.date,
      item.name,
      item.type,
      item.method,
      item.paidAmount,
      item.totalAmount,
      runningBalance,
      item.note,
    ];
  });

  return buildCsv(
    [
      "Date",
      "Seller",
      "Type",
      "Method",
      "Paid Amount (Rs)",
      "Total Amount (Rs)",
      "Balance After (Rs)",
      "Note",
    ],
    rows
  );
}

async function buildSellerEntriesCsv(dairyId: number, monthStart: Date, monthEnd: Date) {
  const entries = await prisma.sellerEntry.findMany({
    where: {
      dairyId,
      date: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
    include: {
      seller: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });

  return buildCsv(
    [
      "Date",
      "Seller",
      "Shift",
      "Milk Type",
      "Litres",
      "Fat",
      "LR",
      "Rate (Rs/L)",
      "Total Amount (Rs)",
    ],
    entries.map((entry) => [
      entry.date,
      `${entry.seller.firstName} ${entry.seller.lastName}`,
      entry.shift,
      entry.milkType,
      entry.litres,
      entry.fat,
      entry.lr,
      entry.rate,
      entry.totalAmount,
    ])
  );
}

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

    const report = searchParams.get("report");
    if (!isExportReport(report)) {
      return jsonError("Invalid export report", 400);
    }

    const access = await requireOwnedDairy(session, dairyId);
    if (!access.ok) {
      return access.response;
    }

    const selectedMonth = getMonthFromSearchParams(searchParams);
    const filename = `${report}-${selectedMonth.value}.csv`;

    let csv = "";

    switch (report) {
      case "buyer-ledger":
        csv = await buildBuyerLedgerCsv(dairyId, selectedMonth.start, selectedMonth.end);
        break;
      case "buyer-entries":
        csv = await buildBuyerEntriesCsv(dairyId, selectedMonth.start, selectedMonth.end);
        break;
      case "seller-ledger":
        csv = await buildSellerLedgerCsv(dairyId, selectedMonth.start, selectedMonth.end);
        break;
      case "seller-entries":
        csv = await buildSellerEntriesCsv(dairyId, selectedMonth.start, selectedMonth.end);
        break;
    }

    return createCsvResponse(filename, csv);
  } catch (error) {
    console.error("Failed to export dairy report:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
