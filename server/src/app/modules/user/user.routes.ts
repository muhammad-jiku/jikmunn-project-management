import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { UserControllers } from './user.controllers';
import { UserValidations } from './user.validations';

const router = express.Router();

router
  .route('/create')
  .post(
    validateRequest(UserValidations.createUser),
    UserControllers.insertIntoDB
  );

router.route('/').get(UserControllers.getAllFromDB);

router
  .route('/:id')
  .get(UserControllers.getByIdFromDB)
  .patch(
    validateRequest(UserValidations.updateUser),
    UserControllers.updateIntoDB
  )
  .delete(UserControllers.deleteFromDB);

export const UserRoutes = router;
