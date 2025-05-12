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
exports.executeSafeTransaction = executeSafeTransaction;
exports.executeSafeQuery = executeSafeQuery;
const prisma_1 = require("./prisma");
const MAX_RETRIES = process.env.NODE_ENV === 'production' ? 5 : 3;
const INITIAL_DELAY_MS = 200;
const RESET_COOLDOWN_MS = 30000;
const connectionState = {
    lastReset: 0,
    errorCount: 0,
    isResetting: false,
};
function executeSafeTransaction(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        let attempt = 0;
        let lastError = new Error('Initial error');
        while (attempt < MAX_RETRIES) {
            try {
                return yield prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () { return fn(tx); }), {
                    maxWait: 5000,
                    timeout: 15000,
                });
            }
            catch (error) {
                lastError = error;
                if (shouldRetry(error)) {
                    attempt++;
                    const delay = getBackoffDelay(attempt);
                    console.warn(`Transaction retry #${attempt} in ${delay}ms`); // debugging log
                    yield delayExecution(delay);
                    continue;
                }
                throw error;
            }
        }
        yield handleRetryExhausted();
        throw lastError;
    });
}
function executeSafeQuery(fn, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let attempt = 0;
        let lastError = new Error('Initial error');
        while (attempt < MAX_RETRIES) {
            try {
                return yield fn();
            }
            catch (error) {
                lastError = error;
                if (shouldRetry(error)) {
                    attempt++;
                    const delay = getBackoffDelay(attempt);
                    console.warn(`Query retry #${attempt} in ${delay}ms${context ? ` [${context}]` : ''}`); // debugging log
                    yield delayExecution(delay);
                    continue;
                }
                throw error;
            }
        }
        yield handleRetryExhausted();
        throw lastError;
    });
}
// Helper functions
function shouldRetry(error) {
    if (!(error instanceof Error))
        return false;
    const retryCodes = new Set([
        '26000', // Prepared statement does not exist
        '42P05', // Prepared statement already exists
        '08S01', // Connection exception
        '57P01', // Admin shutdown
        '57P02', // Shutdown in progress
        '57P03', // Cannot connect now
    ]);
    const message = error.message.toLowerCase();
    return (Array.from(retryCodes).some((code) => message.includes(code)) ||
        message.includes('connection') ||
        message.includes('pool') ||
        message.includes('pgbouncer'));
}
function getBackoffDelay(attempt) {
    const jitter = Math.random() * 100;
    return Math.min(INITIAL_DELAY_MS * Math.pow(2, attempt), 5000) + jitter;
}
function delayExecution(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
function handleRetryExhausted() {
    return __awaiter(this, void 0, void 0, function* () {
        connectionState.errorCount++;
        if (connectionState.errorCount >= 3 &&
            Date.now() - connectionState.lastReset > RESET_COOLDOWN_MS) {
            yield resetConnection();
        }
    });
}
function resetConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connectionState.isResetting)
            return;
        connectionState.isResetting = true;
        console.log('[DB] Initiating connection reset...'); // debugging log
        try {
            yield prisma_1.prisma.$disconnect();
            yield delayExecution(1000);
            yield prisma_1.prisma.$connect();
            connectionState.errorCount = 0;
            connectionState.lastReset = Date.now();
            console.log('[DB] Connection reset successful'); // debugging log
        }
        catch (error) {
            console.error('[DB] Connection reset failed:', error); // debugging log
        }
        finally {
            connectionState.isResetting = false;
        }
    });
}
