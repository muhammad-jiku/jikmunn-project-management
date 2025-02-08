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
router.post(
  '/login',
  validateRequest(AuthValidations.loginUserHandler),
  loginLimiter,
  AuthControllers.loginUserHandler
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidations.refreshTokenHandler),
  AuthControllers.refreshTokenHandler
);

router.post(
  '/forgot-password',
  validateRequest(AuthValidations.forgotPasswordHandler),
  passwordResetLimiter,
  AuthControllers.forgotPasswordHandler
);

router.post(
  '/reset-password',
  validateRequest(AuthValidations.resetPasswordHandler),
  AuthControllers.resetPasswordHandler
);

// Protected routes
router.get(
  '/me',
  auth(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.MANAGER,
    USER_ROLES.DEVELOPER
  ),
  AuthControllers.getCurrentUserHandler
);

router.post(
  '/change-password',
  auth(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.MANAGER,
    USER_ROLES.DEVELOPER
  ),
  validateRequest(AuthValidations.changePasswordHandler),
  AuthControllers.changePasswordHandler
);

router.post(
  '/logout',
  auth(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.MANAGER,
    USER_ROLES.DEVELOPER
  ),
  AuthControllers.logoutHandler
);

export const AuthRoutes = router;
