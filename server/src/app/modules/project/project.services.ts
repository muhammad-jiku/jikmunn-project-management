import { Prisma, Project } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { projectSearchableFields } from './project.constants';
import { IProjectFilterRequest } from './project.interfaces';

const insertIntoDB = async (payload: Project): Promise<Project | null> => {
  try {
    //
    const newProject = await prisma.project.create({
      data: {
        ...payload,
      },
    });

    console.log('Project created', newProject);

    return newProject;
  } catch (error) {
    console.error('Error during user creation:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create project!'
    );
  }
};

const getAllFromDB = async (
  filters: IProjectFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Project[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: projectSearchableFields.map((field) => ({
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

  const whereConditions: Prisma.ProjectWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.project.findMany({
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
  const total = await prisma.project.count({
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

const getByIdFromDB = async (id: number): Promise<Project | null> => {
  const result = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Sorry, the project does not exist!'
    );
  }

  return result;
};

const updateIntoDB = async (
  id: number,
  payload: Partial<Project>
): Promise<Project> => {
  const result = await prisma.project.update({
    where: {
      id,
    },
    data: payload,
  });

  if (!result) {
    throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
  }

  return result;
};

const deleteFromDB = async (id: number): Promise<Project | null> => {
  const result = await prisma.project.delete({
    where: {
      id,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to delete!');
  }

  return result;
};

export const ProjectServices = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};
