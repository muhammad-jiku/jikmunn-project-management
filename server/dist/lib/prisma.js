"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.safeTransaction = safeTransaction;
const client_1 = require("@prisma/client");
// Enhanced logging for development
const prismaClientOptions = {
    // Correct type for transaction options
    transactionOptions: {
        maxWait: 20000, // wait up to 20 seconds for a transaction
        timeout: 30000, // allow the transaction to run up to 30 seconds
        isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted,
    },
    errorFormat: 'minimal',
    log: process.env.NODE_ENV === 'development'
        ? [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
        ]
        : undefined,
};
// Create or reuse PrismaClient instance
exports.prisma = global.prisma || new client_1.PrismaClient(prismaClientOptions);
// Configure query logging for development
if (process.env.NODE_ENV === 'development') {
    global.prisma = exports.prisma;
    // Optional: Log slow queries (useful for debugging)
    // Using proper Prisma event typing
    const client = exports.prisma;
    client.$on('query', (e) => {
        if (e.duration > 500) {
            // Log queries taking longer than 500ms
            console.log(`Slow query (${e.duration}ms): ${e.query}`); // debugging log
        }
    });
    // Handle graceful shutdowns
    const cleanup = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Disconnecting Prisma client...'); // debugging log
        yield exports.prisma.$disconnect();
    });
    // Register cleanup handlers
    process.on('beforeExit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}
/**
 * Enhanced transaction wrapper to handle prepared statement errors
 * This provides a safe way to execute transactions with automatic retry
 */
function safeTransaction(fn_1) {
    return __awaiter(this, arguments, void 0, function* (fn, maxRetries = 3) {
        let lastError = null;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    // Add exponential backoff delay between retries
                    const delay = Math.min(100 * Math.pow(2, attempt), 3000);
                    yield new Promise((resolve) => setTimeout(resolve, delay));
                    // For repeated attempts, ensure we have a fresh connection
                    yield exports.prisma.$disconnect();
                    yield exports.prisma.$connect();
                }
                // Execute the transaction
                return yield exports.prisma.$transaction(fn);
            }
            catch (error) {
                lastError = error;
                // Only retry for specific connection/statement errors
                if (isPreparedStatementError(error)) {
                    console.warn(`Transaction failed with statement error (attempt ${attempt + 1}/${maxRetries}): ${error.message}`); // debugging log
                    continue;
                }
                // Don't retry other types of errors
                throw error;
            }
        }
        // If we got here, all retries failed
        console.error('All transaction retry attempts failed'); // debugging log
        throw lastError || new Error('Transaction failed after multiple retries');
    });
}
/**
 * Detect if an error is related to prepared statements
 */
function isPreparedStatementError(error) {
    const errorMessage = error.message.toLowerCase();
    return (errorMessage.includes('prepared statement') ||
        (errorMessage.includes('connector') && errorMessage.includes('statement')));
}
