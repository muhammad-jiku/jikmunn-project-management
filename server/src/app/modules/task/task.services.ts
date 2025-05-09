import { Prisma, Task, TaskStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../lib/prisma';
import {
  executeSafeQuery,
  executeSafeTransaction,
} from '../../../lib/transactionManager';
import { taskSearchableFields } from './task.constants';
import { ITaskFilterRequest } from './task.interfaces';

const insertIntoDB = async (payload: Task): Promise<Task | null> => {
  return await executeSafeTransaction(async (tx) => {
    // Check if task owner exists
    const ownerExists = await tx.user.findUnique({
      where: { userId: payload.authorUserId as string },
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

    // Check if project exists
    const projectExists = await tx.project.findUnique({
      where: { id: payload.projectId },
    });

    if (!projectExists) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Project does not exist!');
    }

    // // Ensure the auto-increment sequence for tbltask is set correctly
    // await tx.$executeRaw`
    //   SELECT setval(
    //     pg_get_serial_sequence('tbltask', 'id'),
    //     (SELECT COALESCE(MAX(id), 0) FROM tbltask) + 1
    //   )
    // `;

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

  // Use safe query wrapper for both data fetch and count
  const [tasks, total] = await Promise.all([
    executeSafeQuery(() =>
      prisma.task.findMany({
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
      })
    ),
    executeSafeQuery(() =>
      prisma.task.count({
        where: whereConditions,
      })
    ),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: tasks,
  };
};

const getByIdFromDB = async (id: number): Promise<Task | null> => {
  const result = await executeSafeQuery(() =>
    prisma.task.findUnique({
      where: { id },
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
    })
  );

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sorry, the task does not exist!');
  }

  return result;
};

const getProjectTasksFromDB = async (
  projectId: number,
  userId: string
): Promise<Task[]> => {
  try {
    // First check if any tasks exist for this user
    const userTasks = await executeSafeQuery(() =>
      prisma.task.findMany({
        where: {
          OR: [{ authorUserId: userId }, { assignedUserId: userId }],
        },
      })
    );

    // If no tasks found for this user, return empty array
    if (userTasks.length === 0) {
      return [];
      // throw new ApiError(
      //   httpStatus.NOT_FOUND,
      //   'Task owner or assignee does not exist!'
      // );
    }

    // Now check if tasks exist for the specific project and user
    return await executeSafeQuery(() =>
      prisma.task.findMany({
        where: {
          AND: [
            { projectId },
            {
              OR: [{ authorUserId: userId }, { assignedUserId: userId }],
            },
          ],
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
      })
    );
  } catch (error) {
    console.error('Error retrieving project tasks:', error); // debugging log
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve project tasks'
    );
  }
};

const getUserTasksFromDB = async (userId: string): Promise<Task[]> => {
  try {
    return await executeSafeQuery(() =>
      prisma.task.findMany({
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
      })
    );
  } catch (error) {
    console.error('Error retrieving user tasks:', error); // debugging log
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve user tasks'
    );
  }
};

const updateOneInDB = async (
  id: number,
  payload: Partial<Task>
): Promise<Task> => {
  return await executeSafeTransaction(async (tx) => {
    // Check if task exists
    const existingTask = await tx.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Task not found!');
    }

    // If updating project author, verify the new author exists
    if (payload.authorUserId) {
      const authorExists = await tx.user.findUnique({
        where: {
          userId: payload.authorUserId as string,
        },
      });

      if (!authorExists) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'New task author does not exist!'
        );
      }
    }

    const result = await tx.task.update({
      where: { id },
      data: payload,
      include: {
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

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
    }

    return result;
  });
};

const updateTaskStatusInDB = async (
  taskId: number,
  status: TaskStatus
): Promise<Task> => {
  try {
    return await executeSafeTransaction(async (tx) => {
      const task = await tx.task.update({
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
      await tx.taskAssignment.create({
        data: {
          taskId,
          userId: task.assignedUserId || task.authorUserId,
          status,
          dueDate: task.dueDate,
        },
      });

      return task;
    });
  } catch (error) {
    console.error('Error updating task status:', error); // debugging log
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update task status'
    );
  }
};

const deleteByIdFromDB = async (taskId: number): Promise<Task> => {
  try {
    return await executeSafeTransaction(async (tx) => {
      // Delete related records first
      await tx.taskAssignment.deleteMany({ where: { taskId } });
      await tx.comment.deleteMany({ where: { taskId } });
      await tx.attachment.deleteMany({ where: { taskId } });

      return await tx.task.delete({
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
    });
  } catch (error) {
    console.error('Error deleting task:', error); // debugging log
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to delete task'
    );
  }
};

export const TaskServices = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  getProjectTasksFromDB,
  getUserTasksFromDB,
  updateOneInDB,
  updateTaskStatusInDB,
  deleteByIdFromDB,
};
