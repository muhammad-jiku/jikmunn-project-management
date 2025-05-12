import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

const MAX_RETRIES = process.env.NODE_ENV === 'production' ? 5 : 3;
const INITIAL_DELAY_MS = 200;
const RESET_COOLDOWN_MS = 30000;

// Updated type definition for Prisma transaction client
type PrismaTxClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const connectionState = {
  lastReset: 0,
  errorCount: 0,
  isResetting: false,
};

export async function executeSafeTransaction<T>(
  fn: (tx: PrismaTxClient) => Promise<T>
): Promise<T> {
  let attempt = 0;
  let lastError: Error = new Error('Initial error');

  while (attempt < MAX_RETRIES) {
    try {
      return await prisma.$transaction(async (tx) => fn(tx), {
        maxWait: 5000,
        timeout: 15000,
      });
    } catch (error) {
      lastError = error as Error;

      if (shouldRetry(error)) {
        attempt++;
        const delay = getBackoffDelay(attempt);
        console.warn(`Transaction retry #${attempt} in ${delay}ms`); // debugging log
        await delayExecution(delay);
        continue;
      }
      throw error;
    }
  }

  await handleRetryExhausted();
  throw lastError;
}

export async function executeSafeQuery<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  let attempt = 0;
  let lastError: Error = new Error('Initial error');

  while (attempt < MAX_RETRIES) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (shouldRetry(error)) {
        attempt++;
        const delay = getBackoffDelay(attempt);
        console.warn(
          `Query retry #${attempt} in ${delay}ms${context ? ` [${context}]` : ''}`
        ); // debugging log
        await delayExecution(delay);
        continue;
      }
      throw error;
    }
  }

  await handleRetryExhausted();
  throw lastError;
}

// Helper functions
function shouldRetry(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const retryCodes = new Set([
    '26000', // Prepared statement does not exist
    '42P05', // Prepared statement already exists
    '08S01', // Connection exception
    '57P01', // Admin shutdown
    '57P02', // Shutdown in progress
    '57P03', // Cannot connect now
  ]);

  const message = error.message.toLowerCase();

  return (
    Array.from(retryCodes).some((code) => message.includes(code)) ||
    message.includes('connection') ||
    message.includes('pool') ||
    message.includes('pgbouncer')
  );
}

function getBackoffDelay(attempt: number): number {
  const jitter = Math.random() * 100;
  return Math.min(INITIAL_DELAY_MS * Math.pow(2, attempt), 5000) + jitter;
}

async function delayExecution(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleRetryExhausted(): Promise<void> {
  connectionState.errorCount++;

  if (
    connectionState.errorCount >= 3 &&
    Date.now() - connectionState.lastReset > RESET_COOLDOWN_MS
  ) {
    await resetConnection();
  }
}

async function resetConnection(): Promise<void> {
  if (connectionState.isResetting) return;

  connectionState.isResetting = true;
  console.log('[DB] Initiating connection reset...'); // debugging log

  try {
    await prisma.$disconnect();
    await delayExecution(1000);
    await prisma.$connect();
    connectionState.errorCount = 0;
    connectionState.lastReset = Date.now();
    console.log('[DB] Connection reset successful'); // debugging log
  } catch (error) {
    console.error('[DB] Connection reset failed:', error); // debugging log
  } finally {
    connectionState.isResetting = false;
  }
}
