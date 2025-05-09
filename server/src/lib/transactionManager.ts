import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

/**
 * This utility provides enhanced transaction support with automatic retry and error recovery
 * specifically designed to address prepared statement errors in development and production.
 */

// Store connection state information
const connectionState = {
  lastReset: Date.now(),
  consecutiveErrors: 0,
  isResetting: false,
};

/**
 * Execute a function within a transaction with prepared statement error handling
 * @param transactionFn Function to execute within the transaction
 * @returns Result of the transaction
 */
export async function executeSafeTransaction<T>(
  transactionFn: (
    tx: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ) => Promise<T>
): Promise<T> {
  try {
    // Try to execute the transaction normally
    return await prisma.$transaction(transactionFn);
  } catch (error) {
    // Check if this is a prepared statement error that we can recover from
    if (isPreparedStatementError(error)) {
      console.warn(
        'Detected prepared statement error, attempting recovery:',
        (error as Error).message
      ); // debugging log

      // Increment consecutive error count
      connectionState.consecutiveErrors++;

      // If we're seeing too many errors, perform full connection reset
      if (
        connectionState.consecutiveErrors >= 3 &&
        !connectionState.isResetting
      ) {
        await resetConnection();
      }

      // Add a small delay before retry to allow connections to stabilize
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Retry the transaction once after recovery attempt
      try {
        return await prisma.$transaction(transactionFn);
      } catch (retryError) {
        console.error(
          'Transaction retry failed after recovery attempt:',
          (retryError as Error).message
        ); // debugging log

        throw retryError;
      }
    } else {
      // For non-connection errors, just throw normally
      throw error;
    }
  }
}

/**
 * Enhanced query wrapper to handle prepared statement errors for non-transaction queries
 * @param queryFn Function that executes a Prisma query
 * @returns Result of the query
 */
export async function executeSafeQuery<T>(
  queryFn: () => Promise<T>
): Promise<T> {
  try {
    // Try to execute the query normally
    return await queryFn();
  } catch (error) {
    // Check if this is a prepared statement error that we can recover from
    if (isPreparedStatementError(error)) {
      console.warn(
        'Detected prepared statement error in query, attempting recovery:',
        (error as Error).message
      ); // debugging log

      // Increment consecutive error count
      connectionState.consecutiveErrors++;

      // If we're seeing too many errors, perform full connection reset
      if (
        connectionState.consecutiveErrors >= 3 &&
        !connectionState.isResetting
      ) {
        await resetConnection();
      }

      // Add a small delay before retry
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Retry the query once after recovery
      try {
        return await queryFn();
      } catch (retryError) {
        console.error(
          'Query retry failed after recovery attempt:',
          (retryError as Error).message
        ); // debugging log

        throw retryError;
      }
    } else {
      // For non-connection errors, just throw normally
      throw error;
    }
  }
}

/**
 * Reset the database connection when experiencing persistent issues
 */
async function resetConnection(): Promise<void> {
  // Prevent multiple simultaneous resets
  if (connectionState.isResetting) {
    return;
  }

  connectionState.isResetting = true;

  try {
    console.log(
      'Resetting database connection to recover from statement errors...'
    ); // debugging log

    // Disconnect from database
    await prisma.$disconnect();

    // Short delay to ensure connections are fully closed
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Reconnect
    await prisma.$connect();

    // Reset error count after successful reset
    connectionState.consecutiveErrors = 0;
    connectionState.lastReset = Date.now();

    console.log('Database connection reset successful'); // debugging log
  } catch (error) {
    console.error('Failed to reset database connection:', error); // debugging log
  } finally {
    connectionState.isResetting = false;
  }
}

/**
 * Check if an error is related to prepared statements or connection issues
 */
function isPreparedStatementError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const errorMessage = error.message.toLowerCase();
  const errorStack = error.stack?.toLowerCase() || '';

  // Check for specific PostgreSQL error codes and messages
  return (
    // Prepared statement does not exist
    errorMessage.includes('prepared statement') ||
    errorMessage.includes('code: "26000"') ||
    // Prepared statement already exists
    errorMessage.includes('code: "42p05"') ||
    // Generic connector errors that might be related
    (errorMessage.includes('connector') &&
      errorMessage.includes('statement')) ||
    // Check the stack trace for transaction-related errors
    (errorStack.includes('transaction') && errorStack.includes('prisma'))
  );
}
