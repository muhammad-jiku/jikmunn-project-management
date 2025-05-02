import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { ProjectTeamControllers } from './projectTeam.controllers';
import { ProjectTeamValidations } from './projectTeam.validations';

const router = express.Router();

router
  .route('/create')
  .post(
    validateRequest(ProjectTeamValidations.createProjectTeam),
    auth(USER_ROLES.MANAGER),
    ProjectTeamControllers.insertIntoDB
  );
router
  .route('/')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    ProjectTeamControllers.getAllFromDB
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    ProjectTeamControllers.getByIdFromDB
  )
  .patch(
    validateRequest(ProjectTeamValidations.updateProjectTeam),
    auth(USER_ROLES.MANAGER),
    ProjectTeamControllers.updateOneInDB
  )
  .delete(auth(USER_ROLES.MANAGER), ProjectTeamControllers.deleteByIdFromDB);

export const ProjectTeamRoutes = router;
