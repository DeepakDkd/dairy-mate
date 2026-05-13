import { prisma } from "@/lib/prisma";

const startOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const startOfMonth = (date: Date) => {
  const value = new Date(date);
  value.setDate(1);
  value.setHours(0, 0, 0, 0);
  return value;
};

export async function getOwnedDairies(ownerId: number) {
  const dairies = await prisma.dairy.findMany({
    where: { ownerId },
    select: {
      id: true,
      name: true,
      address: true,
      pricingMode: true,
      mawaPricePerKg: true,
      createdAt: true,
      users: {
        select: {
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return dairies.map((dairy) => {
    const sellers = dairy.users.filter((user) => user.role === "SELLER").length;
    const buyers = dairy.users.filter((user) => user.role === "BUYER").length;
    const staff = dairy.users.filter((user) => user.role === "STAFF").length;

    return {
      id: dairy.id,
      name: dairy.name,
      address: dairy.address,
      pricingMode: dairy.pricingMode,
      mawaPricePerKg: dairy.mawaPricePerKg,
      stats: {
        sellers,
        buyers,
        staff,
      },
    };
  });
}

export async function getOwnedDairy(ownerId: number, dairyId: number) {
  const dairy = await prisma.dairy.findFirst({
    where: {
      id: dairyId,
      ownerId,
    },
    select: {
      id: true,
      name: true,
      address: true,
      email: true,
      phone: true,
      pricingMode: true,
      mawaPricePerKg: true,
      users: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!dairy) {
    return null;
  }

  const sellers = dairy.users.filter((user) => user.role === "SELLER").length;
  const buyers = dairy.users.filter((user) => user.role === "BUYER").length;
  const staff = dairy.users.filter((user) => user.role === "STAFF").length;

  return {
    ...dairy,
    stats: {
      sellers,
      buyers,
      staff,
    },
  };
}

export async function getFirstOwnedDairyId(ownerId: number) {
  const dairy = await prisma.dairy.findFirst({
    where: { ownerId },
    select: { id: true },
    orderBy: {
      createdAt: "desc",
    },
  });

  return dairy?.id ?? null;
}

export async function getOwnerPortalOverview(ownerId: number) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);

  const dairies = await prisma.dairy.findMany({
    where: { ownerId },
    select: {
      id: true,
      name: true,
      users: {
        select: {
          role: true,
        },
      },
      sellerEntries: {
        where: {
          date: {
            gte: monthStart,
          },
        },
        select: {
          id: true,
          litres: true,
          totalAmount: true,
          date: true,
          seller: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      buyerEntries: {
        where: {
          date: {
            gte: monthStart,
          },
        },
        select: {
          id: true,
          litres: true,
          totalAmount: true,
          date: true,
          buyer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      accountBalances: {
        select: {
          currentBalance: true,
          user: {
            select: {
              role: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const sellerEntries = dairies.flatMap((dairy) =>
    dairy.sellerEntries.map((entry) => ({
      ...entry,
      dairyName: dairy.name,
      kind: "Seller" as const,
      personName: `${entry.seller.firstName} ${entry.seller.lastName}`,
    }))
  );

  const buyerEntries = dairies.flatMap((dairy) =>
    dairy.buyerEntries.map((entry) => ({
      ...entry,
      dairyName: dairy.name,
      kind: "Buyer" as const,
      personName: `${entry.buyer.firstName} ${entry.buyer.lastName}`,
    }))
  );

  const allEntries = [...sellerEntries, ...buyerEntries];
  const sellerBalances = dairies.flatMap((dairy) =>
    dairy.accountBalances.filter((balance) => balance.user.role === "SELLER")
  );
  const buyerBalances = dairies.flatMap((dairy) =>
    dairy.accountBalances.filter((balance) => balance.user.role === "BUYER")
  );

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = startOfDay(now);
    date.setDate(date.getDate() - (6 - index));

    return {
      day: date.toLocaleString("en-US", { weekday: "short" }),
      dateString: date.toISOString().split("T")[0],
      collected: 0,
      supplied: 0,
    };
  });

  for (const entry of sellerEntries) {
    const entryDate = startOfDay(new Date(entry.date)).toISOString().split("T")[0];
    const day = last7Days.find((item) => item.dateString === entryDate);
    if (day) {
      day.collected += entry.litres;
    }
  }

  for (const entry of buyerEntries) {
    const entryDate = startOfDay(new Date(entry.date)).toISOString().split("T")[0];
    const day = last7Days.find((item) => item.dateString === entryDate);
    if (day) {
      day.supplied += entry.litres;
    }
  }

  const recentTransactions = allEntries
    .sort((first, second) => second.date.getTime() - first.date.getTime())
    .slice(0, 8)
    .map((entry) => ({
      id: `${entry.kind}-${entry.id}`,
      dairyName: entry.dairyName,
      personName: entry.personName,
      type: entry.kind,
      litres: entry.litres,
      amount: entry.totalAmount,
      date: entry.date,
    }));

  return {
    totals: {
      dairies: dairies.length,
      sellers: dairies.reduce(
        (total, dairy) => total + dairy.users.filter((user) => user.role === "SELLER").length,
        0
      ),
      buyers: dairies.reduce(
        (total, dairy) => total + dairy.users.filter((user) => user.role === "BUYER").length,
        0
      ),
      staff: dairies.reduce(
        (total, dairy) => total + dairy.users.filter((user) => user.role === "STAFF").length,
        0
      ),
      monthlyMilkCollected: sellerEntries.reduce((total, entry) => total + entry.litres, 0),
      monthlyMilkSupplied: buyerEntries.reduce((total, entry) => total + entry.litres, 0),
      monthlySellerAmount: sellerEntries.reduce((total, entry) => total + entry.totalAmount, 0),
      monthlyBuyerAmount: buyerEntries.reduce((total, entry) => total + entry.totalAmount, 0),
      todayCollected: sellerEntries
        .filter((entry) => entry.date >= todayStart)
        .reduce((total, entry) => total + entry.litres, 0),
      todaySupplied: buyerEntries
        .filter((entry) => entry.date >= todayStart)
        .reduce((total, entry) => total + entry.litres, 0),
      sellerBalance: sellerBalances.reduce((total, balance) => total + balance.currentBalance, 0),
      buyerBalance: buyerBalances.reduce((total, balance) => total + balance.currentBalance, 0),
    },
    last7Days,
    recentTransactions,
  };
}
