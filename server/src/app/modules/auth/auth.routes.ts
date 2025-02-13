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
router
  .route('/login')
  .post(
    validateRequest(AuthValidations.loginUserHandler),
    loginLimiter,
    AuthControllers.loginUserHandler
  );

router
  .route('/refresh-token')
  .post(
    validateRequest(AuthValidations.refreshTokenHandler),
    AuthControllers.refreshTokenHandler
  );

router
  .route('/forgot-password')
  .post(
    validateRequest(AuthValidations.forgotPasswordHandler),
    passwordResetLimiter,
    AuthControllers.forgotPasswordHandler
  );

router
  .route('/reset-password')
  .post(
    validateRequest(AuthValidations.resetPasswordHandler),
    AuthControllers.resetPasswordHandler
  );

router.route('/verify-email').post(
  // Optionally, you could add validation middleware here if needed
  AuthControllers.verifyEmailHandler
);

// Protected routes
router
  .route('/me')
  .get(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.MANAGER,
      USER_ROLES.DEVELOPER
    ),
    AuthControllers.getCurrentUserHandler
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

router
  .route('/logout')
  .post(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.MANAGER,
      USER_ROLES.DEVELOPER
    ),
    AuthControllers.logoutHandler
  );

export const AuthRoutes = router;
