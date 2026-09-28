import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

if (globalForPrisma.prisma && !(globalForPrisma.prisma as any).pushSubscription) {
  try {
    globalForPrisma.prisma.$disconnect();
  } catch {}
  delete globalForPrisma.prisma;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
