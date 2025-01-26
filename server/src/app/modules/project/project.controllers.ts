import { Project } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
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
      const filters = pick(req.query, projectFilterableFields);
      const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

      const result = await ProjectServices.getAllFromDB(filters, options);

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

      const result = await ProjectServices.updateIntoDB(Number(id), payload);

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

const deleteFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const result = await ProjectServices.deleteFromDB(Number(id));

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
  deleteFromDB,
};
