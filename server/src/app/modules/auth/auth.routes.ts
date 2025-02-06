import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { auth } from '../../middlewares/auth';
import {
  loginLimiter,
  passwordResetLimiter,
} from '../../middlewares/rateLimiter';
import { validateRequest } from '../../middlewares/validateRequest';
import { AuthControllers } from './auth.controllers';
import { AuthValidations } from './auth.validations';

const router = express.Router();

router.route('/login').post(
  validateRequest(AuthValidations.loginUserHandler),
  loginLimiter, // Add rate limiting here
  AuthControllers.loginUserHandler
);

router
  .route('/refresh-token')
  .post(
    validateRequest(AuthValidations.refreshTokenHandler),
    AuthControllers.refreshTokenHandler
  );

router.route('/forgot-password').post(
  validateRequest(AuthValidations.forgotPasswordHandler),
  passwordResetLimiter, // Add rate limiting here
  AuthControllers.forgotPasswordHandler
);

router
  .route('/reset-password')
  .post(
    validateRequest(AuthValidations.resetPasswordHandler),
    AuthControllers.resetPasswordHandler
  );

router
  .route('/change-password')
  .post(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.MANAGER,
      USER_ROLES.DEVELOPER
    ),
    validateRequest(AuthValidations.changePasswordHandler),
    AuthControllers.changePasswordHandler
  );

export const AuthRoutes = router;
