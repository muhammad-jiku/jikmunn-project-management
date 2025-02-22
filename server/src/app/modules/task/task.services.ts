import { Prisma, Task, TaskStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { taskSearchableFields } from './task.constants';
import { ITaskFilterRequest } from './task.interfaces';

const insertIntoDB = async (payload: Task): Promise<Task | null> => {
  console.log('Task payload', payload);

  return await prisma.$transaction(async (tx) => {
    // Check if task owner exists
    const ownerExists = await tx.user.findUnique({
      where: { userId: payload.authorUserId },
    });

    if (!ownerExists) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Task owner does not exist!');
    }

    // Check if task assignee exists
    const assigneeExists = await tx.user.findUnique({
      where: { userId: payload.assignedUserId as string },
    });

    if (!assigneeExists) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Task assignee does not exist!');
    }

    // Ensure the auto-increment sequence for tbltask is set correctly
    await tx.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('tbltask', 'id'),
        (SELECT COALESCE(MAX(id), 0) FROM tbltask) + 1
      )
    `;

    const result = await tx.task.create({
      data: payload,
      include: {
        project: true,
        author: {
          include: {
            manager: true,
            developer: true,
          },
        },
        assignee: {
          include: {
            developer: true,
          },
        },
        attachments: true,
        comments: true,
        TaskAssignment: true,
      },
    });

    console.log('Result task', result);
    if (!result) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create task!'
      );
    }

    return result;
  });
};

const getAllFromDB = async (
  userId: string,
  filters: ITaskFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Task[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
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

  const whereConditions: Prisma.TaskWhereInput = {
    OR: [{ authorUserId: userId }, { assignedUserId: userId }],
    ...(andConditions.length > 0 && { AND: andConditions }),
  };

  const tasks = await prisma.task.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      project: true,
      author: {
        include: {
          manager: true,
          developer: true,
        },
      },
      assignee: {
        include: {
          developer: true,
        },
      },
      attachments: true,
      comments: true,
      TaskAssignment: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const total = await prisma.task.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: tasks,
  };
};

const getUserTasksFromDB = async (userId: string): Promise<Task[]> => {
  try {
    return await prisma.task.findMany({
      where: {
        OR: [{ authorUserId: userId }, { assignedUserId: userId }],
      },
      include: {
        project: true,
        author: {
          include: {
            manager: true,
            developer: true,
          },
        },
        assignee: {
          include: {
            developer: true,
          },
        },
        attachments: true,
        comments: true,
        TaskAssignment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error retrieving user tasks:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve user tasks'
    );
  }
};

const updateTaskStatusInDB = async (
  taskId: number,
  status: TaskStatus
): Promise<Task> => {
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        project: true,
        author: {
          include: {
            manager: true,
            developer: true,
          },
        },
        assignee: {
          include: {
            developer: true,
          },
        },
        attachments: true,
        comments: true,
        TaskAssignment: true,
      },
    });

    // Create a task assignment record
    await prisma.taskAssignment.create({
      data: {
        taskId,
        userId: task.assignedUserId || task.authorUserId,
        status,
        dueDate: task.dueDate,
      },
    });

    return task;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update task status'
    );
  }
};

const deleteByIdFromDB = async (taskId: number): Promise<Task> => {
  try {
    // Delete related records first
    await prisma.$transaction([
      prisma.taskAssignment.deleteMany({ where: { taskId } }),
      prisma.comment.deleteMany({ where: { taskId } }),
      prisma.attachment.deleteMany({ where: { taskId } }),
    ]);

    return await prisma.task.delete({
      where: { id: taskId },
      include: {
        project: true,
        author: {
          include: {
            manager: true,
            developer: true,
          },
        },
        assignee: {
          include: {
            developer: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to delete task'
    );
  }
};

export const TaskServices = {
  insertIntoDB,
  getAllFromDB,
  getUserTasksFromDB,
  updateTaskStatusInDB,
  deleteByIdFromDB,
};
