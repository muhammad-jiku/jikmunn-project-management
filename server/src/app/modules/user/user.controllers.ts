import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import { AuthResponse } from '../auth/auth.interfaces';
import { UserServices } from './user.services';

const insertDeveloperIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { developer, ...userData } = req.body;
      const result = await UserServices.insertDeveloperIntoDB(
        developer,
        userData,
        res
      );

      sendResponse<AuthResponse>(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User created successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const insertManagerIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { manager, ...userData } = req.body;
      const result = await UserServices.insertManagerIntoDB(
        manager,
        userData,
        res
      );

      sendResponse<AuthResponse>(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User created successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const insertAdminIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { admin, ...userData } = req.body;
      const result = await UserServices.insertAdminIntoDB(admin, userData, res);

      sendResponse<AuthResponse>(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User created successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const insertSuperAdminIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { superAdmin, ...userData } = req.body;
      const result = await UserServices.insertSuperAdminIntoDB(
        superAdmin,
        userData,
        res
      );

      sendResponse<AuthResponse>(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User created successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const UserControllers = {
  insertDeveloperIntoDB,
  insertManagerIntoDB,
  insertAdminIntoDB,
  insertSuperAdminIntoDB,
};
