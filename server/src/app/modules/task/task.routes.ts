import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { TaskControllers } from './task.controllers';
import { TaskValidations } from './task.validations';

const router = express.Router();

router
  .route('/create')
  .post(
    validateRequest(TaskValidations.createTask),
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TaskControllers.insertIntoDB
  );

router
  .route('/')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TaskControllers.getAllFromDB
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TaskControllers.getByIdFromDB
  )
  .patch(
    validateRequest(TaskValidations.updateTask),
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TaskControllers.updateInDB
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

router
  .route('/status/:id')
  .patch(
    validateRequest(TaskValidations.updateTask),
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TaskControllers.updateTaskStatusInDB
  );

router
  .route('/project/:id')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TaskControllers.getProjectTasksFromDB
  );

router
  .route('/user/:userId')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TaskControllers.getUserTasksFromDB
  );

export const TaskRoutes = router;
