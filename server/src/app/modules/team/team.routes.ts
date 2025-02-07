import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { auth } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { TeamControllers } from './team.controllers';
import { TeamValidations } from './team.validations';

const router = express.Router();

router
  .route('/create')
  .post(
    validateRequest(TeamValidations.createTeam),
    auth(USER_ROLES.MANAGER),
    TeamControllers.insertIntoDB
  );

router
  .route('/')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TeamControllers.getAllFromDB
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.MANAGER, USER_ROLES.DEVELOPER),
    TeamControllers.getByIdFromDB
  )
  .patch(
    validateRequest(TeamValidations.updateTeam),
    auth(USER_ROLES.MANAGER),
    TeamControllers.updateOneInDB
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    TeamControllers.deleteByIdFromDB
  );

export const TeamRoutes = router;
