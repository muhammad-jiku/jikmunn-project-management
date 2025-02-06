import { Developer, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { developerSearchableFields } from './developer.constants';
import { IDeveloperFilterRequest } from './developer.interfaces';

// Get all developers
const getAllFromDB = async (
  filters: IDeveloperFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Developer[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: developerSearchableFields.map((field) => ({
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

  const whereConditions: Prisma.DeveloperWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.developer.findMany({
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
  const total = await prisma.developer.count({
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

// Get a single developer by ID
const getByIdFromDB = async (id: string): Promise<Developer | null> => {
  const result = await prisma.developer.findUnique({
    where: {
      developerId: id,
    },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Sorry, the developer does not exist!'
    );
  }

  return result;
};

// Update a developer by ID
const updateOneInDB = async (
  id: string,
  payload: Prisma.DeveloperUpdateInput
): Promise<Developer | null> => {
  // First check if developer exists
  const existingDeveloper = await prisma.developer.findUnique({
    where: { developerId: id },
  });

  if (!existingDeveloper) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Developer not found!');
  }

  const result = await prisma.developer.update({
    where: { developerId: id },
    data: payload,
  });

  if (!result) {
    throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
  }

  return result;
};

// Delete a super admin by ID
const deleteByIdFromDB = async (id: string): Promise<Developer | null> => {
  return await prisma.$transaction(async (tx) => {
    const developer = await tx.developer.findUnique({
      where: { developerId: id },
      include: { user: true },
    });

    if (!developer) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Sorry, the developer does not exist!'
      );
    }

    console.log('developer ', developer);
    console.log('user', developer.user);
    if (developer.user) {
      await tx.user.delete({
        where: { userId: developer.user.userId },
      });
    }

    const result = await tx.developer.delete({
      where: { developerId: id },
    });

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to delete!');
    }

    return result;
  });
};

export const DeveloperServices = {
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
