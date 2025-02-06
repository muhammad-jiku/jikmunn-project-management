import { SuperAdmin } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import { catchAsync } from '../../../shared/catchAsync';
import { pick } from '../../../shared/pick';
import { sendResponse } from '../../../shared/sendResponse';
import { superAdminFilterableFields } from './superAdmin.constants';
import { SuperAdminServices } from './superAdmin.services';

const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = pick(req.query, superAdminFilterableFields);
      const options = pick(req.query, paginationFields);

      const result = await SuperAdminServices.getAllFromDB(filters, options);

      sendResponse<SuperAdmin[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Super admins data fetched successfully!!',
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

      const result = await SuperAdminServices.getByIdFromDB(id);

      sendResponse<SuperAdmin>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Super admin data fetched successfully!!',
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

      const result = await SuperAdminServices.updateOneInDB(id, payload);

      sendResponse<SuperAdmin>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Super admin data updated successfully!!',
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

      const result = await SuperAdminServices.deleteByIdFromDB(id);

      sendResponse<SuperAdmin>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Super admin data deleted successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const SuperAdminControllers = {
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
