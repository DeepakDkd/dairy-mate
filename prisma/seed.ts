import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting DairyMate Seed...");

  // ================================================
  // 1. CREATE OWNER
  // ================================================
  const owner = await prisma.user.create({
    data: {
      fullName: "Super Owner",
      email: "owner@dairy.com",
      phone: "9999999999",
      password: "hashed_password",
      role: Role.OWNER,
    },
  });

  console.log("👑 Owner created:", owner.email);

  // ================================================
  // 2. CREATE DAIRIES FOR THIS OWNER
  // ================================================
  const dairy1 = await prisma.dairy.create({
    data: {
      name: "Sharma Dairy",
      address: "Main Road, Village A",
      phone: "8888888888",
      ownerId: owner.id,
    },
  });

  const dairy2 = await prisma.dairy.create({
    data: {
      name: "Sharma Dairy Branch 2",
      address: "Market Chowk, Village B",
      phone: "7777777777",
      ownerId: owner.id,
    },
  });

  console.log("🐄 Dairies created!");

  // ================================================
  // 3. CREATE STAFF FOR DAIRY 1
  // ================================================
  const staff = await prisma.user.create({
    data: {
      fullName: "Raju Staff",
      email: "staff@dairy.com",
      phone: "9898989898",
      password: "staff_password",
      role: Role.STAFF,
      dairyId: dairy1.id,

      staffProfile: {
        create: {
          position: "Cashier",
          salary: 12000,
          joinDate: new Date("2023-06-15"),
          dairyId: dairy1.id,
        },
      },
    },
  });

  console.log("👷 Staff created:", staff.email);

  // ================================================
  // 4. CREATE SELLERS
  // ================================================
  const seller1 = await prisma.user.create({
    data: {
      fullName: "Farmer Kishan",
      email: "seller1@dairy.com",
      phone: "7000000001",
      password: "password123",
      role: Role.SELLER,
      dairyId: dairy1.id,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      fullName: "Farmer Ramesh",
      email: "seller2@dairy.com",
      phone: "7000000002",
      password: "password123",
      role: Role.SELLER,
      dairyId: dairy1.id,
    },
  });

  console.log("🧑‍🌾 Sellers created!");

  // ================================================
  // 5. CREATE BUYERS
  // ================================================
  const buyer1 = await prisma.user.create({
    data: {
      fullName: "Buyer Mohan",
      email: "buyer1@dairy.com",
      phone: "6000000001",
      password: "password123",
      role: Role.BUYER,
      dairyId: dairy1.id,
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      fullName: "Buyer Sita",
      email: "buyer2@dairy.com",
      phone: "6000000002",
      password: "password123",
      role: Role.BUYER,
      dairyId: dairy1.id,
    },
  });

  console.log("🛒 Buyers created!");

  // ================================================
  // 6. CREATE FAT RATE CHART
  // ================================================
  await prisma.milkRate.createMany({
    data: [
      { dairyId: dairy1.id,milkType:"BUFFALO", fat: 8.5,lr: 26, price: 48 },
      { dairyId: dairy1.id,milkType:"BUFFALO", fat: 9.0,lr: 26, price: 52 },
      { dairyId: dairy1.id,milkType:"BUFFALO", fat: 10.0,lr: 26, price: 60 },
      { dairyId: dairy1.id,milkType:"BUFFALO", fat: 11.0,lr: 26, price: 72 },
    ],
  });

  console.log("🥛 Fat Rate Chart added!");

  // ================================================
  // 7. SAMPLE SELLER ENTRIES
  // ================================================
  await prisma.sellerEntry.createMany({
    data: [
      {
        dairyId: dairy1.id,
        sellerId: seller1.id,
        date: new Date(),
        litres: 4,
        fat: 10.0,
        rate: 60,
        totalAmount: 540,
      },
      {
        dairyId: dairy1.id,
        sellerId: seller2.id,
        date: new Date(),
        litres: 6.5,
        fat: 9.0,
        rate: 52,
        totalAmount: 494,
      },
    ],
  });

  console.log("📥 Seller Entries added!");

  // ================================================
  // 8. SAMPLE BUYER ENTRIES
  // ================================================
  await prisma.buyerEntry.createMany({
    data: [
      {
        dairyId: dairy1.id,
        buyerId: buyer1.id,
        date: new Date(),

        litres: 1.5,
        rate: 60,
        totalAmount: 150,
      },
      {
        dairyId: dairy1.id,
        buyerId: buyer2.id,
        date: new Date(),
        litres: 2,
        rate: 60,
        totalAmount: 240,
      },
    ],
  });

  console.log("📤 Buyer Entries added!");

  // ================================================
  // 9. SUBSCRIPTION PLANS
  // ================================================
  const basicPlan = await prisma.subscriptionPlan.create({
    data: {
      name: "Basic",
      price: 199,
      maxSellers: 50,
      maxBuyers: 50,
      maxStaff: 5,
      maxEntries: 2000,
      durationDays: 30,
    },
  });

  // ================================================
  // 10. SUBSCRIPTION FOR DAIRY
  // ================================================
  await prisma.dairySubscription.create({
    data: {
      dairyId: dairy1.id,
      planId: basicPlan.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  console.log("💳 Subscription created!");

  console.log("🎉 SEED SUCCESS!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
