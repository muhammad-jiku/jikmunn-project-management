import { Prisma, SuperAdmin } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { superAdminSearchableFields } from './superAdmin.constants';
import { ISuperAdminFilterRequest } from './superAdmin.interfaces';

// Get all super admins
const getAllFromDB = async (
  filters: ISuperAdminFilterRequest,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<SuperAdmin[]>> => {
  const { searchTerm, ...filterData } = filters;
  const { page, limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions: Prisma.SuperAdminWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: superAdminSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: {
          equals: value,
        },
      })),
    });
  }

  const whereConditions: Prisma.SuperAdminWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const superAdmins = await prisma.superAdmin.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      paginationOptions.sortBy && paginationOptions.sortOrder
        ? { [paginationOptions.sortBy]: paginationOptions.sortOrder }
        : undefined,
  });

  const total = await prisma.superAdmin.count({ where: whereConditions });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: superAdmins,
  };
};

// Get a single super admin by ID
const getByIdFromDB = async (id: string): Promise<SuperAdmin | null> => {
  const result = await prisma.superAdmin.findUnique({
    where: { superAdminId: id },
  });
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Sorry, the super admin does not exist!'
    );
  }

  return result;
};

// Update a super admin by ID
const updateOneInDB = async (
  id: string,
  payload: Prisma.SuperAdminUpdateInput
): Promise<SuperAdmin | null> => {
  // First check if super admin exists
  const existingSuperAdmin = await prisma.superAdmin.findUnique({
    where: { superAdminId: id },
  });

  if (!existingSuperAdmin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Super admin not found!');
  }

  const result = await prisma.superAdmin.update({
    where: { superAdminId: id },
    data: payload,
  });

  if (!result) {
    throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
  }

  return result;
};

// Delete a super admin by ID
const deleteByIdFromDB = async (id: string): Promise<SuperAdmin | null> => {
  return await prisma.$transaction(async (tx) => {
    const superAdmin = await tx.superAdmin.findUnique({
      where: { superAdminId: id },
      include: { user: true },
    });

    if (!superAdmin) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Sorry, the super admin does not exist!'
      );
    }

    console.log('super admin', superAdmin);
    console.log('user', superAdmin.user);
    if (superAdmin.user) {
      await tx.user.delete({
        where: { userId: superAdmin.user.userId },
      });
    }

    const result = await tx.superAdmin.delete({
      where: { superAdminId: id },
    });

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to delete!');
    }

    return result;
  });
};

export const SuperAdminServices = {
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
