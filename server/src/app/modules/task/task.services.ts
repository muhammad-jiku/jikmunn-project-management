import { Prisma, Task } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { taskSearchableFields } from './task.constants';
import { ITaskFilterRequest } from './task.interfaces';

const insertIntoDB = async (payload: Task): Promise<Task> => {
  try {
    const newTask = await prisma.task.create({
      data: {
        ...payload,
      },
    });

    console.info('Task created:', newTask);
    return newTask;
  } catch (error) {
    console.error('Error during task creation:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create task!'
    );
  }
};

const getAllFromDB = async (
  projectId: number,
  filters: ITaskFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Task[]>> => {
  try {
    const { limit, page, skip } =
      paginationHelpers.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

    if (searchTerm) {
      andConditions.push({
        OR: taskSearchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        })),
      });
    }

    if (Object.keys(filterData).length > 0) {
      andConditions.push({
        AND: Object.keys(filterData).map((key) => ({
          [key]: {
            equals: (filterData as any)[key],
          },
        })),
      });
    }

    const whereConditions: Prisma.TaskWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        AND: [whereConditions],
      },
      skip,
      take: limit,
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
    });

    const total = await prisma.task.count({
      where: {
        projectId,
        AND: [whereConditions],
      },
    });

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: tasks,
    };
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve tasks data!'
    );
  }
};

const getUserTasksFromDB = async (userId: number): Promise<Task[]> => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ authorUserId: userId }, { assignedUserId: userId }],
      },
      include: {
        author: true,
        assignee: true,
      },
    });

    return tasks;
  } catch (error) {
    console.error('Error retrieving user tasks:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve user tasks!'
    );
  }
};

const updateTaskStatusInDB = async (
  taskId: number,
  status: string
): Promise<Task> => {
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status,
      },
    });

    return updatedTask;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw new ApiError(httpStatus.CONFLICT, 'Failed to update task status!');
  }
};

const deleteFromDB = async (taskId: number): Promise<Task> => {
  try {
    const task = await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Task not found!');
    }

    return task;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to delete task!'
    );
  }
};

export const TaskServices = {
  insertIntoDB,
  getAllFromDB,
  getUserTasksFromDB,
  updateTaskStatusInDB,
  deleteFromDB,
};
