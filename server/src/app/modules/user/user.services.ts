import { Prisma, User } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { userSearchableFields } from './user.constants';
import { IUserFilterRequest } from './user.interfaces';

const insertIntoDB = async (payload: User): Promise<User> => {
  try {
    const newUser = await prisma.user.create({
      data: {
        ...payload,
      },
    });

    console.info('User created:', newUser);
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user!'
    );
  }
};

const getAllFromDB = async (
  filters: IUserFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<User[]>> => {
  try {
    const { limit, page, skip } =
      paginationHelpers.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

    if (searchTerm) {
      andConditions.push({
        OR: userSearchableFields.map((field) => ({
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

    const whereConditions: Prisma.UserWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const users = await prisma.user.findMany({
      where: whereConditions,
      skip,
      take: limit,
    });

    const total = await prisma.user.count({
      where: whereConditions,
    });

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: users,
    };
  } catch (error) {
    console.error('Error retrieving users:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve users!'
    );
  }
};

const getByIdFromDB = async (cognitoId: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        cognitoId,
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
    }

    return user;
  } catch (error) {
    console.error('Error retrieving user:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve user!'
    );
  }
};

const updateIntoDB = async (
  cognitoId: string,
  payload: User
): Promise<User> => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        cognitoId,
      },
      data: payload,
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update user!'
    );
  }
};

const deleteFromDB = async (cognitoId: string): Promise<User> => {
  try {
    const user = await prisma.user.delete({
      where: {
        cognitoId,
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
    }

    return user;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to delete user!'
    );
  }
};

export const UserServices = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};
