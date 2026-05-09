import { prisma } from "@/lib/prisma";

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
