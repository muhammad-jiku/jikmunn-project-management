import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import { catchAsync } from '../../../shared/catchAsync';
import { pick } from '../../../shared/pick';
import { sendResponse } from '../../../shared/sendResponse';
import { userFilterableFields } from './user.constants';
import { UserServices } from './user.services';

const insertIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await UserServices.insertIntoDB(req.body);

      sendResponse<User>(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User created successfully!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = pick(req.query, userFilterableFields);
      const options = pick(req.query, paginationFields);

      const result = await UserServices.getAllFromDB(filters, options);

      sendResponse<User[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users data retrieved successfully!',
        meta: result.meta,
        data: result.data,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const getByIdFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const result = await UserServices.getByIdFromDB(id);

      sendResponse<User>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User data retrieved successfully!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const updateIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const result = await UserServices.updateIntoDB(id, req.body);

      sendResponse<User>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User data updated successfully!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const deleteFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const result = await UserServices.deleteFromDB(id);

      sendResponse<User>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User deleted successfully!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const UserControllers = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};
