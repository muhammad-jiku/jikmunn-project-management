import express from 'express';
import rateLimit from 'express-rate-limit';
import { USER_ROLES } from '../../../enums/user';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { SuperAdminControllers } from './superAdmin.controllers';
import { SuperAdminValidations } from './superAdmin.validations';

const router = express.Router();

// Rate limiting
const superAdminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

router.use(superAdminLimiter);

router
  .route('/')
  .get(auth(USER_ROLES.SUPER_ADMIN), SuperAdminControllers.getAllFromDB);

router
  .route('/:id')
  .get(
    validateRequest(SuperAdminValidations.validateSuperAdminId),
    auth(USER_ROLES.SUPER_ADMIN),
    SuperAdminControllers.getByIdFromDB
  )
  .patch(
    validateRequest(SuperAdminValidations.validateSuperAdminId),
    validateRequest(SuperAdminValidations.updateSuperAdmin),
    auth(USER_ROLES.SUPER_ADMIN),
    SuperAdminControllers.updateOneInDB
  )
  .delete(
    validateRequest(SuperAdminValidations.validateSuperAdminId),
    auth(USER_ROLES.SUPER_ADMIN),
    SuperAdminControllers.deleteByIdFromDB
  );

export const SuperAdminRoutes = router;
