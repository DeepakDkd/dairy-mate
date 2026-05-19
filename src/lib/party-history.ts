import { prisma } from "@/lib/prisma";

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export async function getSellerPortalHistory(userId: number) {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [seller, monthlyStats] = await Promise.all([
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
  ]);

  if (!seller) return null;

  return {
    seller,
    monthlyStats: {
      litres: monthlyStats._sum.litres ?? 0,
      amount: monthlyStats._sum.totalAmount ?? 0,
      entryCount: monthlyStats._count._all ?? 0,
    },
  };
}

export async function getBuyerPortalHistory(userId: number) {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [buyer, monthlyStats] = await Promise.all([
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
  ]);

  if (!buyer) return null;

  return {
    buyer,
    monthlyStats: {
      litres: monthlyStats._sum.litres ?? 0,
      amount: monthlyStats._sum.totalAmount ?? 0,
      entryCount: monthlyStats._count._all ?? 0,
    },
  };
}
