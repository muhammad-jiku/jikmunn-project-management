import { Task } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import { catchAsync } from '../../../shared/catchAsync';
import { pick } from '../../../shared/pick';
import { sendResponse } from '../../../shared/sendResponse';
import { taskFilterableFields } from './task.constants';
import { TaskServices } from './task.services';

const insertIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await TaskServices.insertIntoDB(req.body);

      sendResponse<Task>(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Task created successfully!',
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
      const { projectId } = req.params;
      const filters = pick(req.query, taskFilterableFields);
      const options = pick(req.query, paginationFields);

      console.log('project id..', projectId);
      console.log('filters..', filters);
      console.log('options..', options);

      const result = await TaskServices.getAllFromDB(
        Number(projectId),
        filters,
        options
      );

      sendResponse<Task[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Tasks data retrieved successfully!',
        meta: result.meta,
        data: result.data,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const getUserTasksFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      const result = await TaskServices.getUserTasksFromDB(Number(userId));

      sendResponse<Task[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User tasks retrieved successfully!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const updateTaskStatusInDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await TaskServices.updateTaskStatusInDB(
        Number(id),
        status
      );

      sendResponse<Task>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task status updated successfully!',
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

      const result = await TaskServices.deleteFromDB(Number(id));

      sendResponse<Task>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task deleted successfully!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const TaskControllers = {
  insertIntoDB,
  getAllFromDB,
  getUserTasksFromDB,
  updateTaskStatusInDB,
  deleteFromDB,
};
