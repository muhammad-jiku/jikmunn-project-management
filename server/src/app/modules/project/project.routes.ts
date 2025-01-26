import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { ProjectControllers } from './project.controllers';
import { ProjectValidations } from './project.validations';

const router = express.Router();

router
  .route('/create')
  .post(
    validateRequest(ProjectValidations.createProject),
    ProjectControllers.insertIntoDB
  );

router.route('/').get(ProjectControllers.getAllFromDB);

router
  .route('/:id')
  .get(ProjectControllers.getByIdFromDB)
  .patch(
    validateRequest(ProjectValidations.updateProject),
    ProjectControllers.updateIntoDB
  )
  .delete(ProjectControllers.deleteFromDB);

export const ProjectRoutes = router;
