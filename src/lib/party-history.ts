import { prisma } from "@/lib/prisma";

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export async function getSellerPortalHistory(userId: number) {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [seller, monthlyStats, payments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        dairy: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
        accountBalance: true,
      },
    }),
    prisma.sellerEntry.aggregate({
      where: {
        sellerId: userId,
        date: { gte: monthStart },
      },
      _sum: {
        litres: true,
        totalAmount: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.payment.findMany({
      where: {
        userId,
        type: "SELLER_PAYMENT",
      },
      orderBy: { date: "asc" },
    }),
  ]);

  if (!seller) return null;

  const entries = await prisma.sellerEntry.findMany({
    where: { sellerId: userId },
    orderBy: { date: "asc" },
  });

  const merged = [
    ...entries.map((entry) => ({
      id: `entry-${entry.id}`,
      date: entry.date,
      type: "MILK_ENTRY" as const,
      amount: entry.totalAmount,
      delta: -entry.totalAmount,
      litres: entry.litres,
      rate: entry.rate,
      shift: entry.shift,
      note: `${entry.shift} milk collection`,
    })),
    ...payments.map((payment) => ({
      id: `payment-${payment.id}`,
      date: payment.date,
      type: "PAYMENT" as const,
      amount: payment.amount,
      delta: payment.amount,
      litres: null,
      rate: null,
      shift: null,
      note: payment.notes || `Payment via ${payment.method}`,
    })),
  ].sort((first, second) => first.date.getTime() - second.date.getTime());

  let runningBalance = 0;
  const history = merged.map((item) => {
    runningBalance += item.delta;
    return {
      ...item,
      balanceAfter: runningBalance,
    };
  }).reverse();

  return {
    seller,
    monthlyStats: {
      litres: monthlyStats._sum.litres ?? 0,
      amount: monthlyStats._sum.totalAmount ?? 0,
      entryCount: monthlyStats._count._all ?? 0,
    },
    history,
  };
}

export async function getBuyerPortalHistory(userId: number) {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [buyer, monthlyStats, payments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        dairy: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
        accountBalance: true,
      },
    }),
    prisma.buyerEntry.aggregate({
      where: {
        buyerId: userId,
        date: { gte: monthStart },
      },
      _sum: {
        litres: true,
        totalAmount: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.payment.findMany({
      where: {
        userId,
        type: "BUYER_PAYMENT",
      },
      orderBy: { date: "asc" },
    }),
  ]);

  if (!buyer) return null;

  const entries = await prisma.buyerEntry.findMany({
    where: { buyerId: userId },
    orderBy: { date: "asc" },
  });

  const merged = [
    ...entries.map((entry) => ({
      id: `entry-${entry.id}`,
      date: entry.date,
      type: "MILK_ENTRY" as const,
      amount: entry.totalAmount,
      delta: entry.totalAmount,
      litres: entry.litres,
      rate: entry.rate,
      shift: entry.shift,
      note: `${entry.shift} milk supply`,
    })),
    ...payments.map((payment) => ({
      id: `payment-${payment.id}`,
      date: payment.date,
      type: "PAYMENT" as const,
      amount: payment.amount,
      delta: -payment.amount,
      litres: null,
      rate: null,
      shift: null,
      note: payment.notes || `Payment via ${payment.method}`,
    })),
  ].sort((first, second) => first.date.getTime() - second.date.getTime());

  let runningBalance = 0;
  const history = merged.map((item) => {
    runningBalance += item.delta;
    return {
      ...item,
      balanceAfter: runningBalance,
    };
  }).reverse();

  return {
    buyer,
    monthlyStats: {
      litres: monthlyStats._sum.litres ?? 0,
      amount: monthlyStats._sum.totalAmount ?? 0,
      entryCount: monthlyStats._count._all ?? 0,
    },
    history,
  };
}
