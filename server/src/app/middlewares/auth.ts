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

      // Check Authorization header first and if not found, check cookies fallback for token
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
      }
      console.log('req.headers', req.headers.authorization); // debugging log
      console.log('req.cookies', req.cookies); // debugging log
      console.log('token', token); // debugging log
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
      }
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.secret as string
      );

      // Check if the verified user has one of the required roles
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden access');
      }

      req.user = verifiedUser;

      next();
    } catch (error) {
      next(error);
    }
  };
