import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { ProjectControllers } from './project.controllers';
import { ProjectValidations } from './project.validations';

const router = express.Router();

router
  .route('/create')
  .post(
    validateRequest(ProjectValidations.createProject),
    auth(USER_ROLES.MANAGER),
    ProjectControllers.insertIntoDB
  );

router
  .route('/')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    ProjectControllers.getAllFromDB
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    ProjectControllers.getByIdFromDB
  )
  .patch(
    validateRequest(ProjectValidations.updateProject),
    auth(USER_ROLES.MANAGER),
    ProjectControllers.updateIntoDB
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    ProjectControllers.deleteFromDB
  );

router
  .route('/teams/update')
  .post(
    validateRequest(ProjectValidations.updateProjectTeams),
    auth(USER_ROLES.MANAGER),
    ProjectControllers.updateProjectTeamsById
  );

export const ProjectRoutes = router;
