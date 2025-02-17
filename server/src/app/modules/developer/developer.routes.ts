import express from 'express';
import rateLimit from 'express-rate-limit';
import { USER_ROLES } from '../../../enums/user';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { DeveloperControllers } from './developer.controllers';
import { DeveloperValidations } from './developer.validations';

const router = express.Router();

// Rate limiting
const developerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

router.use(developerLimiter);

router
  .route('/')
  .get(auth(USER_ROLES.DEVELOPER), DeveloperControllers.getAllFromDB);

router
  .route('/:id')
  .get(auth(USER_ROLES.DEVELOPER), DeveloperControllers.getByIdFromDB)
  .patch(
    validateRequest(DeveloperValidations.updateDeveloper),
    auth(USER_ROLES.DEVELOPER),
    DeveloperControllers.updateOneInDB
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    DeveloperControllers.deleteByIdFromDB
  );

export const DeveloperRoutes = router;
