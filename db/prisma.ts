import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Sets up WebSocket connections for Neon
neonConfig.webSocketConstructor = ws;

// Create Prisma instance with Neon adapter
const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const end = performance.now();
        console.log(`${model}.${operation} took ${end - start}ms`);
        return result;
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
