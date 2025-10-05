
import { PrismaClient } from '../../generated/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Ensure the client is connected
export async function connectPrisma() {
  try {
    await prisma.$connect();
    console.log('Prisma connected successfully');
  } catch (error) {
    console.error('Failed to connect to Prisma:', error);
    throw error;
  }
}

// Graceful shutdown
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
