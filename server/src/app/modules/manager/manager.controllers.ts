import { Manager } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import { catchAsync } from '../../../shared/catchAsync';
import { pick } from '../../../shared/pick';
import { sendResponse } from '../../../shared/sendResponse';
import { managerFilterableFields } from './manager.constants';
import { ManagerServices } from './manager.services';

const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = pick(req.query, managerFilterableFields);
      const options = pick(req.query, paginationFields);

      const result = await ManagerServices.getAllFromDB(filters, options);

      sendResponse<Manager[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Managers data fetched successfully!!',
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

      const result = await ManagerServices.getByIdFromDB(id);

      sendResponse<Manager>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Manager data fetched successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const updateOneInDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const payload = await req.body;

      const result = await ManagerServices.updateOneInDB(id, payload);

      sendResponse<Manager>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Manager data updated successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const deleteByIdFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const result = await ManagerServices.deleteByIdFromDB(id);

      sendResponse<Manager>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Manager data deleted successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const ManagerControllers = {
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
