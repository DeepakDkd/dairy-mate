import { PrismaClient, Role, MilkType, Shift, StaffRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Real-world DairyMate Seed...");

  // ================================================
  // 0. CLEANUP DATABASE
  // ================================================
  console.log("🧹 Cleaning up database...");
  await prisma.notification.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.monthlySettlement.deleteMany();
  await prisma.buyerEntry.deleteMany();
  await prisma.sellerEntry.deleteMany();
  await prisma.milkRate.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.dairySubscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.accountBalance.deleteMany();
  await prisma.otpRequest.deleteMany();
  await prisma.user.updateMany({ data: { dairyId: null } });
  await prisma.dairy.deleteMany();
  await prisma.user.deleteMany();

  // Hashed Passwords
  const ownerPassword = bcrypt.hashSync("9575649891", 10);
  const commonPassword = bcrypt.hashSync("password123", 10);

  // ================================================
  // 1. CREATE OWNER (Deepak Dhakad)
  // ================================================
  const owner = await prisma.user.create({
    data: {
      firstName: "Deepak",
      lastName: "Dhakad",
      email: "deepakdkd1188@gmail.com",
      phone: "9575649891",
      password: ownerPassword,
      role: Role.OWNER,
    },
  });

  console.log("👑 Owner created:", owner.email);

  // ================================================
  // 2. CREATE DAIRIES FOR DEEPAK DHAKAD
  // ================================================
  const dairy1 = await prisma.dairy.create({
    data: {
      name: "Dhakad Dairy Farm",
      address: "Industrial Area, Sector A, Indore",
      phone: "9575649891",
      ownerId: owner.id,
    },
  });

  const dairy2 = await prisma.dairy.create({
    data: {
      name: "Dhakad Milk Parlour & Sweets",
      address: "Vijay Nagar Main Road, Indore",
      phone: "9575649891",
      ownerId: owner.id,
    },
  });

  console.log("🐄 Dairies created!");

  // ================================================
  // 3. SEED STAFF
  // ================================================
  const staffNamesD1 = [
    { first: "Raju", last: "Yadav", phone: "9800000101", email: "raju.yadav@dhakaddairy.com", pos: "Manager", sal: 12000, role: StaffRole.MANAGER },
    { first: "Amit", last: "Patel", phone: "9800000102", email: "amit.patel@dhakaddairy.com", pos: "Milk Tester", sal: 10000, role: StaffRole.MILK_TESTER },
  ];

  const staffNamesD2 = [
    { first: "Vikram", last: "Singh", phone: "9800000201", email: "vikram.singh@dhakaddairy.com", pos: "Manager", sal: 18000, role: StaffRole.MANAGER },
    { first: "Sanjay", last: "Sharma", phone: "9800000202", email: "sanjay.sharma@dhakaddairy.com", pos: "Billing Clerk", sal: 11000, role: StaffRole.MILK_COLLECTOR },
  ];

  for (const s of staffNamesD1) {
    await prisma.user.create({
      data: {
        firstName: s.first,
        lastName: s.last,
        email: s.email,
        phone: s.phone,
        password: commonPassword,
        role: Role.STAFF,
        dairyId: dairy1.id,
        staffProfile: {
          create: {
            role: s.role,
            position: s.pos,
            salary: s.sal,
            joinDate: new Date("2024-01-15"),
            dairyId: dairy1.id,
          },
        },
      },
    });
  }

  for (const s of staffNamesD2) {
    await prisma.user.create({
      data: {
        firstName: s.first,
        lastName: s.last,
        email: s.email,
        phone: s.phone,
        password: commonPassword,
        role: Role.STAFF,
        dairyId: dairy2.id,
        staffProfile: {
          create: {
            role: s.role,
            position: s.pos,
            salary: s.sal,
            joinDate: new Date("2024-03-10"),
            dairyId: dairy2.id,
          },
        },
      },
    });
  }

  console.log("👷 Staff created for both dairies!");

  // ================================================
  // 4. SEED SELLERS (10 per dairy)
  // ================================================
  const sellersD1 = [
    { first: "Ramesh", last: "Prasad", phone: "9100000101", email: "ramesh.prasad@farmers.com" },
    { first: "Suresh", last: "Chand", phone: "9100000102", email: "suresh.chand@farmers.com" },
    { first: "Mahesh", last: "Kumar", phone: "9100000103", email: "mahesh.kumar@farmers.com" },
    { first: "Rajesh", last: "Singh", phone: "9100000104", email: "rajesh.singh@farmers.com" },
    { first: "Dinesh", last: "Sharma", phone: "9100000105", email: "dinesh.sharma@farmers.com" },
    { first: "Harish", last: "Verma", phone: "9100000106", email: "harish.verma@farmers.com" },
    { first: "Mukesh", last: "Gupta", phone: "9100000107", email: "mukesh.gupta@farmers.com" },
    { first: "Sunil", last: "Yadav", phone: "9100000108", email: "sunil.yadav@farmers.com" },
    { first: "Anil", last: "Chaudhary", phone: "9100000109", email: "anil.chaudhary@farmers.com" },
    { first: "Sanjay", last: "Mishra", phone: "9100000110", email: "sanjay.mishra@farmers.com" },
  ];

  const sellersD2 = [
    { first: "Vikram", last: "Rathore", phone: "9100000201", email: "vikram.rathore@farmers.com" },
    { first: "Sandeep", last: "Tomar", phone: "9100000202", email: "sandeep.tomar@farmers.com" },
    { first: "Jitendra", last: "Yadav", phone: "9100000203", email: "jitendra.yadav@farmers.com" },
    { first: "Manoj", last: "Tiwari", phone: "9100000204", email: "manoj.tiwari@farmers.com" },
    { first: "Rakesh", last: "Jhunjhun", phone: "9100000205", email: "rakesh.jhunjhun@farmers.com" },
    { first: "Prem", last: "Chand", phone: "9100000206", email: "prem.chand@farmers.com" },
    { first: "Devendra", last: "Pal", phone: "9100000207", email: "devendra.pal@farmers.com" },
    { first: "Vinod", last: "Kambli", phone: "9100000208", email: "vinod.kambli@farmers.com" },
    { first: "Ashok", last: "Gehlot", phone: "9100000209", email: "ashok.gehlot@farmers.com" },
    { first: "Kamal", last: "Nath", phone: "9100000210", email: "kamal.nath@farmers.com" },
  ];

  const seededSellersD1 = [];
  for (const s of sellersD1) {
    const user = await prisma.user.create({
      data: {
        firstName: s.first,
        lastName: s.last,
        email: s.email,
        phone: s.phone,
        password: commonPassword,
        role: Role.SELLER,
        dairyId: dairy1.id,
      },
    });
    seededSellersD1.push(user);
  }

  const seededSellersD2 = [];
  for (const s of sellersD2) {
    const user = await prisma.user.create({
      data: {
        firstName: s.first,
        lastName: s.last,
        email: s.email,
        phone: s.phone,
        password: commonPassword,
        role: Role.SELLER,
        dairyId: dairy2.id,
      },
    });
    seededSellersD2.push(user);
  }

  console.log("🧑‍🌾 20 Sellers created!");

  // ================================================
  // 5. SEED BUYERS (10 per dairy)
  // ================================================
  const buyersD1 = [
    { first: "Mohan", last: "Lal", phone: "8100000101", email: "mohan.lal@buyers.com" },
    { first: "Sita", last: "Ram", phone: "8100000102", email: "sita.ram@buyers.com" },
    { first: "Gita", last: "Devi", phone: "8100000103", email: "gita.devi@buyers.com" },
    { first: "Radha", last: "Krishna", phone: "8100000104", email: "radha.krishna@buyers.com" },
    { first: "Ram", last: "Charan", phone: "8100000105", email: "ram.charan@buyers.com" },
    { first: "Shyam", last: "Sunder", phone: "8100000106", email: "shyam.sunder@buyers.com" },
    { first: "Shiv", last: "Kumar", phone: "8100000107", email: "shiv.kumar@buyers.com" },
    { first: "Vijay", last: "Kumar", phone: "8100000108", email: "vijay.kumar@buyers.com" },
    { first: "Ajay", last: "Kumar", phone: "8100000109", email: "ajay.kumar@buyers.com" },
    { first: "Sanjay", last: "Kumar", phone: "8100000110", email: "sanjay.kumar1@buyers.com" },
  ];

  const buyersD2 = [
    { first: "Nandu", last: "Bhaiya", phone: "8100000201", email: "nandu.bhaiya@buyers.com" },
    { first: "Pappu", last: "Singh", phone: "8100000202", email: "pappu.singh@buyers.com" },
    { first: "Chhotu", last: "Halwai", phone: "8100000203", email: "chhotu.halwai@buyers.com" },
    { first: "Golu", last: "Sweets", phone: "8100000204", email: "golu.sweets@buyers.com" },
    { first: "Sharma", last: "Tea Stall", phone: "8100000205", email: "sharma.tea@buyers.com" },
    { first: "Verma", last: "Ji Cafe", phone: "8100000206", email: "verma.cafe@buyers.com" },
    { first: "Mishra", last: "Milk Parlour", phone: "8100000207", email: "mishra.milk@buyers.com" },
    { first: "Gupta", last: "Ji Dairy", phone: "8100000208", email: "gupta.dairy@buyers.com" },
    { first: "Patel", last: "Catering", phone: "8100000209", email: "patel.catering@buyers.com" },
    { first: "Yadav", last: "Tea Point", phone: "8100000210", email: "yadav.tea@buyers.com" },
  ];

  const seededBuyersD1 = [];
  for (const b of buyersD1) {
    const user = await prisma.user.create({
      data: {
        firstName: b.first,
        lastName: b.last,
        email: b.email,
        phone: b.phone,
        password: commonPassword,
        role: Role.BUYER,
        dairyId: dairy1.id,
      },
    });
    seededBuyersD1.push(user);
  }

  const seededBuyersD2 = [];
  for (const b of buyersD2) {
    const user = await prisma.user.create({
      data: {
        firstName: b.first,
        lastName: b.last,
        email: b.email,
        phone: b.phone,
        password: commonPassword,
        role: Role.BUYER,
        dairyId: dairy2.id,
      },
    });
    seededBuyersD2.push(user);
  }

  console.log("🛒 20 Buyers created!");

  // ================================================
  // 6. SEED MILK RATES (Fat rate charts)
  // ================================================
  // Seed cow and buffalo milk rates for dairy 1 & 2
  const generateMilkRates = (dairyId: number, basePriceCow: number, basePriceBuffalo: number) => {
    const rates = [];
    // Cow: Fat 3.0 to 5.0, LR 24 to 28
    for (let fat = 3.0; fat <= 5.0; fat += 0.5) {
      for (let lr = 24; lr <= 28; lr += 2) {
        rates.push({
          dairyId,
          milkType: MilkType.COW,
          fat,
          lr,
          price: basePriceCow + (fat - 3.0) * 4 + (lr - 24) * 0.5,
        });
      }
    }
    // Buffalo: Fat 6.0 to 10.0, LR 26 to 30
    for (let fat = 6.0; fat <= 10.0; fat += 1.0) {
      for (let lr = 26; lr <= 30; lr += 2) {
        rates.push({
          dairyId,
          milkType: MilkType.BUFFALO,
          fat,
          lr,
          price: basePriceBuffalo + (fat - 6.0) * 5 + (lr - 26) * 0.6,
        });
      }
    }
    return rates;
  };

  await prisma.milkRate.createMany({
    data: [
      ...generateMilkRates(dairy1.id, 32, 45),
      ...generateMilkRates(dairy2.id, 35, 48),
    ],
  });

  console.log("🥛 Milk Rate Charts seeded!");

  // ================================================
  // 7. SEED REALISTIC SELLER & BUYER ENTRIES (Last 5 days)
  // ================================================
  const generateSellerEntries = (dairyId: number, sellers: any[]) => {
    const entries = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      for (const seller of sellers) {
        // Random liters: 4 to 12
        const litres = Math.round((4 + Math.random() * 8) * 10) / 10;
        const milkType = Math.random() > 0.4 ? MilkType.COW : MilkType.BUFFALO;
        const fat = milkType === MilkType.COW ? 3.5 : 7.5;
        const rate = milkType === MilkType.COW ? 36 : 55;
        const totalAmount = Math.round(litres * rate * 10) / 10;

        entries.push({
          dairyId,
          sellerId: seller.id,
          date,
          litres,
          fat,
          lr: 26,
          milkType,
          rate,
          totalAmount,
          shift: i % 2 === 0 ? Shift.MORNING : Shift.EVENING,
        });
      }
    }
    return entries;
  };

  const generateBuyerEntries = (dairyId: number, buyers: any[]) => {
    const entries = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      for (const buyer of buyers) {
        // Random liters: 2 to 6
        const litres = Math.round((2 + Math.random() * 4) * 10) / 10;
        const rate = 60; // Flat buyer rate
        const totalAmount = Math.round(litres * rate * 10) / 10;

        entries.push({
          dairyId,
          buyerId: buyer.id,
          date,
          litres,
          rate,
          totalAmount,
          shift: i % 2 === 0 ? Shift.MORNING : Shift.EVENING,
        });
      }
    }
    return entries;
  };

  console.log("📥 Generating seller entries...");
  await prisma.sellerEntry.createMany({
    data: [
      ...generateSellerEntries(dairy1.id, seededSellersD1),
      ...generateSellerEntries(dairy2.id, seededSellersD2),
    ],
  });

  console.log("📤 Generating buyer entries...");
  await prisma.buyerEntry.createMany({
    data: [
      ...generateBuyerEntries(dairy1.id, seededBuyersD1),
      ...generateBuyerEntries(dairy2.id, seededBuyersD2),
    ],
  });

  console.log("📊 Entries added!");

  // ================================================
  // 8. UPDATE ACCOUNT BALANCES
  // ================================================
  console.log("💰 Calculating and setting user account balances...");
  // Let's create account balances for all users based on their entries
  const allUsersD1 = [...seededSellersD1, ...seededBuyersD1];
  const allUsersD2 = [...seededSellersD2, ...seededBuyersD2];

  for (const user of allUsersD1) {
    const entriesSum = user.role === Role.SELLER 
      ? await prisma.sellerEntry.aggregate({ where: { sellerId: user.id }, _sum: { totalAmount: true } })
      : await prisma.buyerEntry.aggregate({ where: { buyerId: user.id }, _sum: { totalAmount: true } });
    
    const balance = (entriesSum._sum.totalAmount ?? 0);
    // For sellers balance is negative (dairy owes them money), for buyers positive (they owe dairy money)
    const currentBalance = user.role === Role.SELLER ? -balance : balance;

    await prisma.accountBalance.create({
      data: {
        dairyId: dairy1.id,
        userId: user.id,
        currentBalance,
      }
    });
  }

  for (const user of allUsersD2) {
    const entriesSum = user.role === Role.SELLER 
      ? await prisma.sellerEntry.aggregate({ where: { sellerId: user.id }, _sum: { totalAmount: true } })
      : await prisma.buyerEntry.aggregate({ where: { buyerId: user.id }, _sum: { totalAmount: true } });
    
    const balance = (entriesSum._sum.totalAmount ?? 0);
    const currentBalance = user.role === Role.SELLER ? -balance : balance;

    await prisma.accountBalance.create({
      data: {
        dairyId: dairy2.id,
        userId: user.id,
        currentBalance,
      }
    });
  }

  // ================================================
  // 9. SUBSCRIPTION PLANS
  // ================================================
  const basicPlan = await prisma.subscriptionPlan.create({
    data: {
      name: "Premium Enterprise",
      price: 999,
      maxSellers: 500,
      maxBuyers: 500,
      maxStaff: 50,
      maxEntries: 100000,
      durationDays: 365,
    },
  });

  // ================================================
  // 10. SUBSCRIPTIONS FOR BOTH DAIRIES
  // ================================================
  await prisma.dairySubscription.createMany({
    data: [
      {
        dairyId: dairy1.id,
        planId: basicPlan.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        dairyId: dairy2.id,
        planId: basicPlan.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ],
  });

  console.log("💳 Subscriptions created!");
  console.log("🎉 SEED SUCCESS!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
