import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { TaskControllers } from './task.controllers';
import { TaskValidations } from './task.validations';

const router = express.Router();

router
  .route('/create')
  .post(
    validateRequest(TaskValidations.createTask),
    TaskControllers.insertIntoDB
  );

router.route('/:projectId').get(TaskControllers.getAllFromDB);

router
  .route('/:id')
  .patch(
    validateRequest(TaskValidations.updateTask),
    TaskControllers.updateTaskStatusInDB
  )
  .delete(TaskControllers.deleteFromDB);

router.route('/user/:userId').get(TaskControllers.getUserTasksFromDB);

export const TaskRoutes = router;
