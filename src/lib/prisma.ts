import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const defaultDatabaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_LYkqfO5VHE1x@ep-steep-band-b4jget58-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: defaultDatabaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
