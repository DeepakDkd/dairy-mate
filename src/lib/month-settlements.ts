import prisma from "@/lib/prisma";
import { getMonthValue, parseMonthValue } from "@/utils/month";

type SettlementClient = Pick<
  typeof prisma,
  "monthlySettlement" | "buyerEntry" | "sellerEntry" | "payment"
>;

export function getMonthLockedMessage(monthLabel: string) {
  return `${monthLabel} is closed. Reopen the month to change entries or payments.`;
}

export async function getMonthSettlementStatus(
  client: SettlementClient,
  dairyId: number,
  monthValue?: string | null
) {
  const selectedMonth = parseMonthValue(monthValue);
  const settlement = await client.monthlySettlement.findUnique({
    where: {
      dairyId_monthStart: {
        dairyId,
        monthStart: selectedMonth.start,
      },
    },
    select: {
      id: true,
      isClosed: true,
      closedAt: true,
      reopenedAt: true,
      notes: true,
      buyerClosingBalance: true,
      sellerClosingBalance: true,
      monthlyBuyerAmount: true,
      monthlySellerAmount: true,
    },
  });

  return {
    selectedMonth,
    settlement,
    isClosed: settlement?.isClosed ?? false,
  };
}

export async function findClosedSettlementForDates(
  client: SettlementClient,
  dairyId: number,
  dates: Array<Date | string | null | undefined>
) {
  const monthValues = Array.from(
    new Set(
      dates
        .filter((value): value is Date | string => Boolean(value))
        .map((value) => getMonthValue(new Date(value)))
    )
  );

  if (monthValues.length === 0) {
    return null;
  }

  for (const monthValue of monthValues) {
    const status = await getMonthSettlementStatus(client, dairyId, monthValue);
    if (status.isClosed) {
      return status;
    }
  }

  return null;
}

export async function buildMonthSettlementSnapshot(
  client: SettlementClient,
  dairyId: number,
  monthValue?: string | null
) {
  const selectedMonth = parseMonthValue(monthValue);

  const [
    monthlyBuyerAmountAgg,
    monthlySellerAmountAgg,
    buyerEntriesBeforeEndAgg,
    buyerPaymentsBeforeEndAgg,
    sellerEntriesBeforeEndAgg,
    sellerPaymentsBeforeEndAgg,
  ] = await Promise.all([
    client.buyerEntry.aggregate({
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
    client.sellerEntry.aggregate({
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
    client.buyerEntry.aggregate({
      where: {
        dairyId,
        date: {
          lt: selectedMonth.end,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    client.payment.aggregate({
      where: {
        dairyId,
        type: "BUYER_PAYMENT",
        date: {
          lt: selectedMonth.end,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    client.sellerEntry.aggregate({
      where: {
        dairyId,
        date: {
          lt: selectedMonth.end,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    client.payment.aggregate({
      where: {
        dairyId,
        type: "SELLER_PAYMENT",
        date: {
          lt: selectedMonth.end,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const monthlyBuyerAmount = monthlyBuyerAmountAgg._sum.totalAmount ?? 0;
  const monthlySellerAmount = monthlySellerAmountAgg._sum.totalAmount ?? 0;
  const buyerClosingBalance =
    (buyerEntriesBeforeEndAgg._sum.totalAmount ?? 0) -
    (buyerPaymentsBeforeEndAgg._sum.amount ?? 0);
  const sellerClosingBalance =
    (sellerPaymentsBeforeEndAgg._sum.amount ?? 0) -
    (sellerEntriesBeforeEndAgg._sum.totalAmount ?? 0);

  return {
    selectedMonth,
    monthlyBuyerAmount,
    monthlySellerAmount,
    buyerClosingBalance,
    sellerClosingBalance,
  };
}
