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
        message: 'Task created successfully',
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

      const filters = pick(req.query, taskFilterableFields);
      const options = pick(req.query, paginationFields);

      const result = await TaskServices.getAllFromDB(
        user.userId,
        filters,
        options
      );

      sendResponse<Task[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Tasks retrieved successfully',
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

      const result = await TaskServices.getByIdFromDB(Number(id));

      sendResponse<Task>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task data fetched successfully!!',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const getProjectTasksFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const result = await TaskServices.getProjectTasksFromDB(
        Number(id),
        user.userId!
      );

      sendResponse<Task[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User's project tasks retrieved successfully",
        data: result,
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
      const result = await TaskServices.getUserTasksFromDB(userId);

      sendResponse<Task[]>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User tasks retrieved successfully',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

const updateInDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const payload = await req.body;

      const result = await TaskServices.updateOneInDB(Number(id), payload);

      sendResponse<Task>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task data updated successfully!!',
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
        message: 'Task status updated successfully',
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
      const result = await TaskServices.deleteByIdFromDB(Number(id));

      sendResponse<Task>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task deleted successfully',
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
  getByIdFromDB,
  getProjectTasksFromDB,
  getUserTasksFromDB,
  updateInDB,
  updateTaskStatusInDB,
  deleteByIdFromDB,
};
