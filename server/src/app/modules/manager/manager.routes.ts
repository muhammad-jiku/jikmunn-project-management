import express from 'express';
import rateLimit from 'express-rate-limit';
import { USER_ROLES } from '../../../enums/user';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { ManagerControllers } from './manager.controllers';
import { ManagerValidations } from './manager.validations';

const router = express.Router();

// Rate limiting
const managerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

router.use(managerLimiter);

router
  .route('/')
  .get(auth(USER_ROLES.MANAGER), ManagerControllers.getAllFromDB);

router
  .route('/:id')
  .get(auth(USER_ROLES.MANAGER), ManagerControllers.getByIdFromDB)
  .patch(
    validateRequest(ManagerValidations.updateManager),
    auth(USER_ROLES.MANAGER),
    ManagerControllers.updateOneInDB
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ManagerControllers.deleteByIdFromDB
  );

export const ManagerRoutes = router;
