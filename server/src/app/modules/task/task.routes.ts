import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { TaskControllers } from './task.controllers';
import { TaskValidations } from './task.validations';

const router = express.Router();

router.post(
  '/create',
  validateRequest(TaskValidations.createTask),
  auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
  TaskControllers.insertIntoDB
);

router.get(
  '/',
  auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
  TaskControllers.getAllFromDB
);

router
  .route('/:id')
  .patch(
    validateRequest(TaskValidations.updateTask),
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TaskControllers.updateTaskStatusInDB
  )
  .delete(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.MANAGER,
      USER_ROLES.DEVELOPER
    ),
    TaskControllers.deleteByIdFromDB
  );

router.get(
  '/user/:userId',
  auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
  TaskControllers.getUserTasksFromDB
);

export const TaskRoutes = router;
