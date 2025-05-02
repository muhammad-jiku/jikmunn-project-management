import { Team } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import { catchAsync } from '../../../shared/catchAsync';
import { pick } from '../../../shared/pick';
import { sendResponse } from '../../../shared/sendResponse';
import { TeamServices } from './team.services';

const insertIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = await req.body;
      const result = await TeamServices.insertIntoDB(payload);

      sendResponse<Team>(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Team created successfully!',
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
      const options = pick(req.query, paginationFields);

      const result = await TeamServices.getAllFromDB(options);

      sendResponse<Team[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Teams data retrieved successfully!',
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
      const result = await TeamServices.getByIdFromDB(Number(id));

      sendResponse<Team>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team data retrieved successfully!',
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
      const result = await TeamServices.updateOneInDB(Number(id), req.body);

      sendResponse<Team>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team data updated successfully!',
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
      const result = await TeamServices.deleteByIdFromDB(Number(id));

      sendResponse<Team>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team data deleted successfully!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const TeamControllers = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
