import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

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
export const ensureDatabaseConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = Date.now();

    // Only check connection health periodically
    if (
      now - middlewareState.lastHealthCheck >
      middlewareState.healthCheckInterval
    ) {
      middlewareState.lastHealthCheck = now;

      // Simple ping query to verify connection
      await prisma.$queryRaw`SELECT 1`;
    }

    // Connection is healthy, proceed with request
    next();
  } catch (error) {
    console.error('Database connection check failed in middleware:', error); // debugging log

    // Only attempt recovery if another reset isn't already in progress
    if (!middlewareState.isPerformingReset) {
      try {
        middlewareState.isPerformingReset = true;

        // Attempt to reset connection
        await prisma.$disconnect();
        await new Promise((resolve) => setTimeout(resolve, 500));
        await prisma.$connect();

        console.log('Database connection successfully reset in middleware'); // debugging log
        next();
      } catch (resetError) {
        console.error(
          'Failed to reset database connection in middleware:',
          resetError
        ); // debugging log

        res.status(503).json({
          success: false,
          message:
            'Database connection is currently unavailable. Please try again shortly.',
        });
      } finally {
        middlewareState.isPerformingReset = false;
      }
    } else {
      // A reset is already in progress, so wait briefly and proceed
      await new Promise((resolve) => setTimeout(resolve, 500));
      next();
    }
  }
};

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
