import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { TeamControllers } from './team.controllers';
import { TeamValidations } from './team.validations';

const router = express.Router();

router
  .route('/create')
  .post(
    validateRequest(TeamValidations.createTeam),
    TeamControllers.insertIntoDB
  );

router.route('/').get(TeamControllers.getAllFromDB);

router
  .route('/:id')
  .get(TeamControllers.getByIdFromDB)
  .patch(
    validateRequest(TeamValidations.updateTeam),
    TeamControllers.updateIntoDB
  )
  .delete(TeamControllers.deleteFromDB);

export const TeamRoutes = router;
