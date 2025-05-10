import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../config';
import ApiError from '../../errors/handleApiError';
import { jwtHelpers } from '../../helpers/jwt';

export const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token;
      // Cast the request to our custom interface
      const reqWithCookies = req as RequestWithCookies;

      // Check for token in this order: 1. Authorization header, 2. Cookies
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (reqWithCookies.cookies && reqWithCookies.cookies.accessToken) {
        token = reqWithCookies.cookies.accessToken;
      }

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
      }

      try {
        const verifiedUser = jwtHelpers.verifyToken(
          token,
          config.jwt.secret as string
        );

        // Check if the verified user has one of the required roles
        if (
          requiredRoles.length &&
          !requiredRoles.includes(verifiedUser.role)
        ) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden access');
        }

        req.user = verifiedUser;
        next();
      } catch (jwtError) {
        // If token verification fails, try to renew using refresh token
        const reqWithCookies = req as RequestWithCookies;
        const refreshToken = reqWithCookies.cookies?.refreshToken;

        if (!refreshToken) {
          throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication failed');
        }

        // You might want to implement automatic token refresh here
        // For now, just throw unauthorized
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Token expired');
      }
    } catch (error) {
      next(error);
    }
  };
