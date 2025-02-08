// import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// const attempts = new Map<string, { count: number; timestamp: number }>();
// const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
// const MAX_ATTEMPTS = 5;

// export const loginLimiter = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const ip = req.ip as string;
//   const now = Date.now();
//   const userAttempts = attempts.get(ip);

//   if (userAttempts) {
//     if (now - userAttempts.timestamp > WINDOW_MS) {
//       attempts.set(ip, { count: 1, timestamp: now });
//     } else if (userAttempts.count >= MAX_ATTEMPTS) {
//       throw new ApiError(
//         httpStatus.TOO_MANY_REQUESTS,
//         'Too many login attempts. Please try again later.'
//       );
//     } else {
//       attempts.set(ip, {
//         count: userAttempts.count + 1,
//         timestamp: userAttempts.timestamp,
//       });
//     }
//   } else {
//     attempts.set(ip, { count: 1, timestamp: now });
//   }

//   // Clean up old entries
//   if (now % 100 === 0) {
//     // Only run cleanup occasionally
//     for (const [key, value] of attempts.entries()) {
//       if (now - value.timestamp > WINDOW_MS) {
//         attempts.delete(key);
//       }
//     }
//   }

//   next();
// };

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message:
      'Too many password reset attempts. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
