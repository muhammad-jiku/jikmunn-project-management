import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { TeamMemberControllers } from './teamMember.controllers';
import { TeamMemberValidations } from './teamMember.validations';

const router = express.Router();

router
  .route('/create')
  .post(
    validateRequest(TeamMemberValidations.createTeamMember),
    auth(USER_ROLES.MANAGER),
    TeamMemberControllers.insertIntoDB
  );

router
  .route('/')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TeamMemberControllers.getAllFromDB
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TeamMemberControllers.getByIdFromDB
  )
  .patch(
    validateRequest(TeamMemberValidations.updateTeamMember),
    auth(USER_ROLES.MANAGER),
    TeamMemberControllers.updateOneInDB
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    TeamMemberControllers.deleteByIdFromDB
  );

export const TeamMemberRoutes = router;
