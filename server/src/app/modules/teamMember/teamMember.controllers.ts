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
      const result = await TeamMemberServices.insertIntoDB(payload);

      sendResponse<TeamMember>(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Team member added successfully!',
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

      const result = await TeamMemberServices.getAllFromDB(options);

      sendResponse<TeamMember[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team members data retrieved successfully!',
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
      const result = await TeamMemberServices.getByIdFromDB(Number(id));

      sendResponse<TeamMember>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team member data retrieved successfully!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const getByTeamIdFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teamId } = req.query;
      const result = await TeamMemberServices.getByTeamIdFromDB(Number(teamId));

      sendResponse<TeamMember[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team members data retrieved successfully!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const getByUserIdFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {
      return next(error);
    }
    const { userId } = req.query;
    const result = await TeamMemberServices.getByUserIdFromDB(userId as string);

    sendResponse<TeamMember[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Team members data retrieved successfully!',
      data: result,
    });
  }
);

const updateOneInDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const payload = await req.body;

      const result = await TeamMemberServices.updateOneInDB(
        Number(id),
        payload
      );

      sendResponse<TeamMember>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team member data updated successfully!',
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
      const result = await TeamMemberServices.deleteByIdFromDB(Number(id));

      sendResponse<TeamMember>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Team member removed successfully!',
        data: result,
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
  getByTeamIdFromDB,
  getByUserIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
