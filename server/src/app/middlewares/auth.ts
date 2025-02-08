import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/handleApiError';
import { jwtHelpers } from '../../helpers/jwt';

export const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get authorization token
      const authHeader = req.headers.authorization;
      console.log('auth header', authHeader);
      if (!authHeader?.startsWith('Bearer ')) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
      }

      const token = authHeader.split(' ')[1];
      console.log('token ', token);
      let verifiedUser = null;
      try {
        verifiedUser = jwtHelpers.verifyToken(
          token,
          config.jwt.secret as Secret
        );
      } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
      }

      console.log('verified user', verifiedUser);
      req.user = verifiedUser;

      console.log('requested verified user', req.user);
      console.log('required roles', requiredRoles);
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden access');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
