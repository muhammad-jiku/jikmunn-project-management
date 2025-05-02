import { ProjectTeam } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import { catchAsync } from '../../../shared/catchAsync';
import { pick } from '../../../shared/pick';
import { sendResponse } from '../../../shared/sendResponse';
import { ProjectTeamServices } from './projectTeam.services';

const insertIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = await req.body;
      const result = await ProjectTeamServices.insertIntoDB(payload);

      sendResponse<ProjectTeam>(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Project team association created successfully!',
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
      const paginationOptions = pick(req.query, paginationFields);
      const result = await ProjectTeamServices.getAllFromDB(paginationOptions);

      sendResponse<ProjectTeam[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project team associations data retrieved successfully.',
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
      const result = await ProjectTeamServices.getByIdFromDB(Number(id));

      sendResponse<ProjectTeam>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project team association data retrieved successfully!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const getByProjectIdFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.query;
      const result = await ProjectTeamServices.getByProjectIdFromDB(
        Number(projectId)
      );

      sendResponse<ProjectTeam[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project team associations data retrieved successfully',
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
      const result = await ProjectTeamServices.getByTeamIdFromDB(
        Number(teamId)
      );

      sendResponse<ProjectTeam[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project team associations data retrieved successfully!',
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

      const result = await ProjectTeamServices.updateOneInDB(
        Number(id),
        payload
      );

      sendResponse<ProjectTeam>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project team association data updated successfully!',
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
      const result = await ProjectTeamServices.deleteByIdFromDB(Number(id));

      sendResponse<ProjectTeam>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project team association data deleted successfully!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const ProjectTeamControllers = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  getByProjectIdFromDB,
  getByTeamIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
