import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  transactionOptions: {
    maxWait: 20_000, // wait up to 20 seconds for a transaction
    timeout: 30_000, // allow the transaction to run up to 30 seconds
    isolationLevel: 'ReadCommitted',
  },
  errorFormat: 'minimal',
});
