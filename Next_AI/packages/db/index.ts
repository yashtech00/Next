import {PrismaClient}  from "@prisma/client";

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set. Prisma will not be able to connect to the database.");
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
