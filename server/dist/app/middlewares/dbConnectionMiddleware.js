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
exports.ensureDatabaseConnection = void 0;
const prisma_1 = require("../../lib/prisma");
// Track middleware state
const middlewareState = {
    lastHealthCheck: 0,
    healthCheckInterval: 60000, // 1 minute
    isPerformingReset: false,
};
/**
 * Express middleware to ensure database connection is healthy
 * Only performs checks periodically to avoid unnecessary overhead
 */
const ensureDatabaseConnection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = Date.now();
        // Only check connection health periodically
        if (now - middlewareState.lastHealthCheck >
            middlewareState.healthCheckInterval) {
            middlewareState.lastHealthCheck = now;
            // Simple ping query to verify connection
            yield prisma_1.prisma.$queryRaw `SELECT 1`;
        }
        // Connection is healthy, proceed with request
        next();
    }
    catch (error) {
        console.error('Database connection check failed in middleware:', error); // debugging log
        // Only attempt recovery if another reset isn't already in progress
        if (!middlewareState.isPerformingReset) {
            try {
                middlewareState.isPerformingReset = true;
                // Attempt to reset connection
                yield prisma_1.prisma.$disconnect();
                yield new Promise((resolve) => setTimeout(resolve, 500));
                yield prisma_1.prisma.$connect();
                console.log('Database connection successfully reset in middleware'); // debugging log
                next();
            }
            catch (resetError) {
                console.error('Failed to reset database connection in middleware:', resetError); // debugging log
                res.status(503).json({
                    success: false,
                    message: 'Database connection is currently unavailable. Please try again shortly.',
                });
            }
            finally {
                middlewareState.isPerformingReset = false;
            }
        }
        else {
            // A reset is already in progress, so wait briefly and proceed
            yield new Promise((resolve) => setTimeout(resolve, 500));
            next();
        }
    }
});
exports.ensureDatabaseConnection = ensureDatabaseConnection;
/**
 * Apply this middleware to your Express app for all API routes
 * Example usage:
 *
 * // In your main app.ts or server.ts file:
 * import { ensureDatabaseConnection } from './path/to/dbConnectionMiddleware';
 *
 * // Apply to all API routes
 * app.use('/api', ensureDatabaseConnection);
 */
