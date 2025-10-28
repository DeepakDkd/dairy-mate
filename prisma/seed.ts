import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  // Create admin user
//   const adminPassword = await bcrypt.hash("admin123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);
  await db.user.upsert({
    where: { mobile: "9999999999" },
    update: {},
    create: {
      mobile: "9999999999",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      customerType: "BUYER",
    },
  });

  // Create test seller
  const sellerPassword = await bcrypt.hash("seller123", 10);
  await db.user.upsert({
    where: { mobile: "8888888888" },
    update: {},
    create: {
      mobile: "8888888888",
      password: sellerPassword,
      name: "Test Seller",
      role: "CUSTOMER",
      customerType: "SELLER",
    },
  });

  // Create test buyer
  const buyerPassword = await bcrypt.hash("buyer123", 10);
  await db.user.upsert({
    where: { mobile: "7777777777" },
    update: {},
    create: {
      mobile: "7777777777",
      password: buyerPassword,
      name: "Test Buyer",
      role: "CUSTOMER",
      customerType: "BUYER",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });