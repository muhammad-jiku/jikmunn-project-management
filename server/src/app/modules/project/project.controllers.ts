import { Project } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import { catchAsync } from '../../../shared/catchAsync';
import { pick } from '../../../shared/pick';
import { sendResponse } from '../../../shared/sendResponse';
import { projectFilterableFields } from './project.constants';
import { ProjectServices } from './project.services';

const insertIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ProjectServices.insertIntoDB(req.body);

      sendResponse<Project>(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Project data created successfully!!',
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
      const user = req.user!;
      const filters = pick(req.query, projectFilterableFields);
      const options = pick(req.query, paginationFields);

      const result = await ProjectServices.getAllFromDB(
        user!.userId,
        filters,
        options
      );

      sendResponse<Project[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Projects data fetched successfully!!',
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
      console.log('id of project', id);
      const result = await ProjectServices.getByIdFromDB(Number(id));

      sendResponse<Project>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project data fetched successfully!!',
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
      const payload = await req.body;

      const result = await ProjectServices.updateOneInDB(Number(id), payload);

      sendResponse<Project>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project data updated successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const updateProjectTeamsById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId, teamIds } = req.body;

      const result = await ProjectServices.updateProjectTeamsById(
        Number(projectId),
        teamIds
      );

      sendResponse<Project>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project teams updated successfully!',
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

      const result = await ProjectServices.deleteByIdFromDB(Number(id));

      sendResponse<Project>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project data deleted successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const ProjectControllers = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  updateProjectTeamsById,
  deleteFromDB,
};
