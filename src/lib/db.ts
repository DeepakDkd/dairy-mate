import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

type AcceleratedPrismaClient = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: AcceleratedPrismaClient | undefined;
};

function createClient() {
  return new PrismaClient().$extends(withAccelerate());
}

// Local dev → reuse global instance
export const prisma =
  process.env.NODE_ENV === "production"
    ? createClient()
    : globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
