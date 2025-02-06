import express from 'express';
import rateLimit from 'express-rate-limit';
import { USER_ROLES } from '../../../enums/user';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { AdminControllers } from './admin.controllers';
import { AdminValidations } from './admin.validations';

const router = express.Router();

// Rate limiting
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

router.use(adminLimiter);

router
  .route('/')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    AdminControllers.getAllFromDB
  );

router
  .route('/:id')
  .get(
    validateRequest(AdminValidations.validateAdminId),
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    AdminControllers.getByIdFromDB
  )
  .patch(
    validateRequest(AdminValidations.validateAdminId),
    validateRequest(AdminValidations.updateAdmin),
    auth(USER_ROLES.ADMIN),
    AdminControllers.updateOneInDB
  )
  .delete(
    validateRequest(AdminValidations.validateAdminId),
    auth(USER_ROLES.SUPER_ADMIN),
    AdminControllers.deleteByIdFromDB
  );

export const AdminRoutes = router;
