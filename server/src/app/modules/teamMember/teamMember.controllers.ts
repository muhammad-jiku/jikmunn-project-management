import { TeamMember } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import { catchAsync } from '../../../shared/catchAsync';
import { pick } from '../../../shared/pick';
import { sendResponse } from '../../../shared/sendResponse';
import { TeamMemberServices } from './teamMember.services';

const insertIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = await req.body;
      const data = await TeamMemberServices.insertIntoDB(payload);

      sendResponse<TeamMember>(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Team member added to team successfully!',
        data,
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
      const result = await TeamMemberServices.getAllFromDB(options);

      sendResponse<TeamMember[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team members list data retrieved successfully!',
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
      const data = await TeamMemberServices.getByIdFromDB(Number(id));

      sendResponse<TeamMember>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team member data retrived successfully!',
        data,
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

      const data = await TeamMemberServices.updateOneInDB(Number(id), payload);

      sendResponse<TeamMember>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team member data updated successfully!',
        data,
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
      const data = await TeamMemberServices.deleteByIdFromDB(Number(id));

      sendResponse<TeamMember>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team member data deleted successfully!',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const TeamMemberControllers = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
