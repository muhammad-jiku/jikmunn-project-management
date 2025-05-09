import { Prisma, PrismaClient } from '@prisma/client';

// Declare global variable for PrismaClient type
declare global {
  var prisma: PrismaClient | undefined;
}

// Enhanced logging for development
const prismaClientOptions: Prisma.PrismaClientOptions = {
  // Correct type for transaction options
  transactionOptions: {
    maxWait: 20_000, // wait up to 20 seconds for a transaction
    timeout: 30_000, // allow the transaction to run up to 30 seconds
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  },
  errorFormat: 'minimal' as Prisma.ErrorFormat,
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : undefined,
};

// Create or reuse PrismaClient instance
export const prisma = global.prisma || new PrismaClient(prismaClientOptions);

// Configure query logging for development
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;

  // Optional: Log slow queries (useful for debugging)
  // Using proper Prisma event typing
  const client = prisma as unknown as {
    $on(
      event: 'query',
      callback: (event: { duration: number; query: string }) => void
    ): void;
  };

  client.$on('query', (e) => {
    if (e.duration > 500) {
      // Log queries taking longer than 500ms
      console.log(`Slow query (${e.duration}ms): ${e.query}`); // debugging log
    }
  });

  // Handle graceful shutdowns
  const cleanup = async () => {
    console.log('Disconnecting Prisma client...'); // debugging log
    await prisma.$disconnect();
  };

  // Register cleanup handlers
  process.on('beforeExit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

/**
 * Enhanced transaction wrapper to handle prepared statement errors
 * This provides a safe way to execute transactions with automatic retry
 */
export async function safeTransaction<T>(
  fn: (
    tx: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Add exponential backoff delay between retries
        const delay = Math.min(100 * Math.pow(2, attempt), 3000);
        await new Promise((resolve) => setTimeout(resolve, delay));

        // For repeated attempts, ensure we have a fresh connection
        await prisma.$disconnect();
        await prisma.$connect();
      }

      // Execute the transaction
      return await prisma.$transaction(fn);
    } catch (error) {
      lastError = error as Error;

      // Only retry for specific connection/statement errors
      if (isPreparedStatementError(error)) {
        console.warn(
          `Transaction failed with statement error (attempt ${attempt + 1}/${maxRetries}): ${(error as Error).message}`
        ); // debugging log

        continue;
      }

      // Don't retry other types of errors
      throw error;
    }
  }

  // If we got here, all retries failed
  console.error('All transaction retry attempts failed'); // debugging log
  throw lastError || new Error('Transaction failed after multiple retries');
}

/**
 * Detect if an error is related to prepared statements
 */
function isPreparedStatementError(error: unknown): boolean {
  const errorMessage = (error as Error).message.toLowerCase();
  return (
    errorMessage.includes('prepared statement') ||
    (errorMessage.includes('connector') && errorMessage.includes('statement'))
  );
}
