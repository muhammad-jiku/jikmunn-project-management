import { Developer } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import { catchAsync } from '../../../shared/catchAsync';
import { pick } from '../../../shared/pick';
import { sendResponse } from '../../../shared/sendResponse';
import { developerFilterableFields } from './developer.constants';
import { DeveloperServices } from './developer.services';

const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = pick(req.query, developerFilterableFields);
      const options = pick(req.query, paginationFields);

      const result = await DeveloperServices.getAllFromDB(filters, options);

      sendResponse<Developer[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Developers data fetched successfully!!',
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

      const result = await DeveloperServices.getByIdFromDB(id);

      sendResponse<Developer>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Developer data fetched successfully!!',
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

      const result = await DeveloperServices.updateOneInDB(id, payload);

      sendResponse<Developer>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Developer data updated successfully!!',
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

      const result = await DeveloperServices.deleteByIdFromDB(id);

      sendResponse<Developer>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Developer data deleted successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const DeveloperControllers = {
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
