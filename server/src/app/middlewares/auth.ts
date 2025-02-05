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
      const token = req.headers.authorization;
      console.log('req token....', token);
      console.log('secret....', config.jwt.secret);
      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'Sorry, you are not authorized to access this route!'
        );
      }

      // verify that token
      let verifiedUserToken = null;
      verifiedUserToken = jwtHelpers.verifyToken(
        token,
        config.jwt.secret as Secret
      );

      console.log('verifyToken....', verifiedUserToken);
      req.user = verifiedUserToken; // userId, role
      console.log('user....', req.user);
      // guard against invalid credentials while verifying user token
      console.log('first required roles...', requiredRoles);
      if (
        requiredRoles.length &&
        !requiredRoles.includes(verifiedUserToken.role)
      ) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'Sorry this route is forbidden!'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
