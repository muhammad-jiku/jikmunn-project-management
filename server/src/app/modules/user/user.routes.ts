import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { UserControllers } from './user.controllers';
import { UserValidations } from './user.validations';

const router = express.Router();

// router
//   .route('/create')
//   .post(
//     validateRequest(UserValidations.createUser),
//     UserControllers.insertIntoDB
//   );

// router.route('/').get(UserControllers.getAllFromDB);

// router
//   .route('/:id')
//   .get(UserControllers.getByIdFromDB)
//   .patch(
//     validateRequest(UserValidations.updateUser),
//     UserControllers.updateIntoDB
//   )
//   .delete(UserControllers.deleteFromDB);

router
  .route('/create-developer')
  .post(
    validateRequest(UserValidations.createDeveloper),
    UserControllers.insertDeveloperIntoDB
  );

router
  .route('/create-manager')
  .post(
    validateRequest(UserValidations.createManager),
    UserControllers.insertManagerIntoDB
  );

router
  .route('/create-admin')
  .post(
    validateRequest(UserValidations.createAdmin),
    UserControllers.insertAdminIntoDB
  );

router
  .route('/create-super-admin')
  .post(
    validateRequest(UserValidations.createSuperAdmin),
    UserControllers.insertSuperAdminIntoDB
  );

export const UserRoutes = router;
