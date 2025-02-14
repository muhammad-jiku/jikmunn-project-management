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
      console.log('token.', token);
      // Check Authorization header first
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
      ) {
        token = req.headers.authorization.split(' ')[1];
        console.log('req headers.', req.headers);
        console.log('token...', token);
      }
      // Fallback: check for token in cookies
      else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
        console.log('req cookies.', req.cookies);
        console.log('token.....', token);
      }
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
      }
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.secret as string
      );

      console.log('verified user.', verifiedUser);
      // Check if the verified user has one of the required roles
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden access');
      }

      req.user = verifiedUser;
      console.log('verified user...', verifiedUser);
      next();
    } catch (error) {
      next(error);
    }
  };
