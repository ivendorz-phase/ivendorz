// Framework-level shared code ("db") — NOT a domain module (REPOSITORY_STRUCTURE section 5).
//
// The single shared Prisma client. Module infrastructure adapters import it; cross-module
// table access remains forbidden (each module touches only its OWN schema's models — One
// Module, One Owner). The client is generated into generated-contracts-registry/prisma
// (GENERATED, gitignored — Doc-6A §11.4); imported here by relative path.

import { PrismaClient, Prisma } from "../../../generated-contracts-registry/prisma";

/**
 * A Prisma execution context: either the base client or an interactive-transaction client.
 * Infrastructure adapters accept this so M0 primitives (human-ref allocation, audit-append)
 * can join a caller's transaction (Doc-4B §A7/§A10 atomicity).
 */
export type DbExecutor = PrismaClient | Prisma.TransactionClient;

// Singleton across hot-reloads / serverless warm starts (avoid connection exhaustion).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient, Prisma };
