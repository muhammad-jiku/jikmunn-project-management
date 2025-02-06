import { Manager, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { managerSearchableFields } from './manager.constants';
import { IManagerFilterRequest } from './manager.interfaces';

// Get all managers
const getAllFromDB = async (
  filters: IManagerFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Manager[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: managerSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  const whereConditions: Prisma.ManagerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.manager.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });
  const total = await prisma.manager.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

// Get a single manager by ID
const getByIdFromDB = async (id: string): Promise<Manager | null> => {
  const result = await prisma.manager.findUnique({
    where: {
      managerId: id,
    },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Sorry, the manager does not exist!'
    );
  }

  return result;
};

// Update a manager by ID
const updateOneInDB = async (
  id: string,
  payload: Prisma.ManagerUpdateInput
): Promise<Manager | null> => {
  // First check if manager exists
  const existingManager = await prisma.manager.findUnique({
    where: { managerId: id },
  });

  if (!existingManager) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Manager not found!');
  }

  const result = await prisma.manager.update({
    where: { managerId: id },
    data: payload,
  });

  if (!result) {
    throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
  }

  return result;
};

// Delete a manager by ID
const deleteByIdFromDB = async (id: string): Promise<Manager | null> => {
  return await prisma.$transaction(async (tx) => {
    const manager = await tx.manager.findUnique({
      where: { managerId: id },
      include: { user: true },
    });

    if (!manager) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Sorry, the manager does not exist!'
      );
    }

    console.log('manager ', manager);
    console.log('user', manager.user);
    if (manager.user) {
      await tx.user.delete({
        where: { userId: manager.user.userId },
      });
    }

    const result = await tx.manager.delete({
      where: { managerId: id },
    });

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to delete!');
    }

    return result;
  });
};

export const ManagerServices = {
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
