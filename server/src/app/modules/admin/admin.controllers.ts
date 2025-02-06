import { Admin } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import { catchAsync } from '../../../shared/catchAsync';
import { pick } from '../../../shared/pick';
import { sendResponse } from '../../../shared/sendResponse';
import { adminFilterableFields } from './admin.constants';
import { AdminServices } from './admin.services';

const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = pick(req.query, adminFilterableFields);
      const options = pick(req.query, paginationFields);

      const result = await AdminServices.getAllFromDB(filters, options);

      sendResponse<Admin[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Admins data fetched successfully!!',
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

      const result = await AdminServices.getByIdFromDB(id);

      sendResponse<Admin>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Admin data fetched successfully!!',
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

      const result = await AdminServices.updateOneInDB(id, payload);

      sendResponse<Admin>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Admin data updated successfully!!',
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

      const result = await AdminServices.deleteByIdFromDB(id);

      sendResponse<Admin>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Admin data deleted successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const AdminControllers = {
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
