import { Prisma, PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientOptions: Prisma.PrismaClientOptions = {
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL,
    },
  },
  transactionOptions: {
    maxWait: 5000,
    timeout: 10000,
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  },
  errorFormat: 'minimal',
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { level: 'warn', emit: 'stdout' },
          { level: 'error', emit: 'stdout' },
          { level: 'query', emit: 'event' },
        ]
      : [],
};

export const prisma = global.prisma || new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;

  // Add query logging
  prisma.$on('query' as never, (e: any) => {
    if (e.duration > 500) {
      console.log(`[SLOW QUERY] ${e.query} (${e.duration}ms)`);
    }
  });

  const cleanup = async () => {
    console.log('[DB] Cleaning up Prisma connection...');
    await prisma.$disconnect();
  };

  process.on('beforeExit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
