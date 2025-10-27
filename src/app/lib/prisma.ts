import { PrismaClient } from "@prisma/client";

const primsmaClientSingleton = () => {
    return new PrismaClient();
}
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? primsmaClientSingleton();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;