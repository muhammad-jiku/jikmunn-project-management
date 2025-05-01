import { Prisma, Project } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { projectSearchableFields } from './project.constants';
import { IProjectFilterRequest } from './project.interfaces';

// Create a new project
const insertIntoDB = async (payload: Project): Promise<Project | null> => {
  console.log('first project..', payload);
  return await prisma.$transaction(async (tx) => {
    // Check if project owner exists
    const ownerExists = await tx.user.findUnique({
      where: { userId: payload.projectOwnerId },
    });

    console.log('existed owner', ownerExists);
    if (!ownerExists) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Project owner (manager) does not exist!'
      );
    }

    // // Ensure the auto-increment sequence for tblproject is set correctly
    // await tx.$executeRaw`
    //   SELECT setval(
    //     pg_get_serial_sequence('tblproject', 'id'),
    //     (SELECT COALESCE(MAX(id), 0) FROM tblproject) + 1
    //   )
    // `;

    const result = await tx.project.create({
      data: payload,
      include: {
        owner: {
          include: {
            manager: true,
          },
        },
        tasks: true,
        projectTeams: true,
      },
    });

    console.log('result project', result);
    if (!result) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create project!'
      );
    }

    return result;
  });
};

// Get all projects with filtering and pagination
const getAllFromDB = async (
  userId: string,
  filters: IProjectFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Project[]>> => {
  console.log('user id ', userId);
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  console.log('filters', filters);
  console.log('options', options);
  console.log('{ limit, page, skip }', { limit, page, skip });

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
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.ProjectWhereInput = {
    OR: [{ projectOwnerId: userId }],
    ...(andConditions.length > 0 && { AND: andConditions }),
  };
  console.log('whereConditions', whereConditions);
  console.log('andConditions', andConditions);

  const result = await prisma.project.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' },
    include: {
      owner: {
        include: {
          manager: true,
        },
      },
      tasks: true,
      projectTeams: {
        include: {
          team: true,
        },
      },
    },
  });

  console.log('result projects', result);
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

// Get a single project by ID
const getByIdFromDB = async (id: number): Promise<Project | null> => {
  const result = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: {
        include: {
          manager: true,
        },
      },
      tasks: true,
      projectTeams: {
        include: {
          team: true,
        },
      },
    },
  });

  console.log('project result', result);
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Sorry, the project does not exist!'
    );
  }

  return result;
};

// Update a project
const updateOneInDB = async (
  id: number,
  payload: Prisma.ProjectUpdateInput
): Promise<Project> => {
  return await prisma.$transaction(async (tx) => {
    // Check if project exists
    const existingProject = await tx.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Project not found!');
    }

    // If updating project owner, verify the new owner exists
    if (payload.owner) {
      const ownerExists = await tx.user.findUnique({
        where: {
          userId: (payload.owner as { connect: { userId: string } }).connect
            .userId,
        },
      });

      if (!ownerExists) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'New project owner (manager) does not exist!'
        );
      }
    }

    const result = await tx.project.update({
      where: { id },
      data: payload,
      include: {
        owner: {
          include: {
            manager: true,
          },
        },
        tasks: true,
        projectTeams: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
    }

    return result;
  });
};

// Update project teams by ID
const updateProjectTeamsById = async (
  projectId: number,
  teamIds: number[]
): Promise<Project> => {
  return await prisma.$transaction(async (tx) => {
    // Check if project exists
    const existingProject = await tx.project.findUnique({
      where: { id: projectId },
      include: {
        projectTeams: true,
      },
    });

    if (!existingProject) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Project not found!');
    }

    // Delete existing team associations
    await tx.projectTeam.deleteMany({
      where: {
        projectId,
      },
    });

    // Create new team associations
    const project = await tx.project.update({
      where: { id: projectId },
      data: {
        projectTeams: {
          create: teamIds.map((teamId) => ({
            team: {
              connect: { id: teamId },
            },
          })),
        },
      },
      include: {
        owner: {
          include: {
            manager: true,
          },
        },
        tasks: true,
        projectTeams: {
          include: {
            team: true,
          },
        },
      },
    });

    return project;
  });
};

// Delete a project by ID
const deleteByIdFromDB = async (id: number): Promise<Project | null> => {
  return await prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({
      where: { id },
      include: {
        tasks: true,
        projectTeams: true,
      },
    });

    if (!project) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Sorry, the project does not exist!'
      );
    }

    // Delete related tasks
    if (project.tasks.length > 0) {
      await tx.task.deleteMany({
        where: { projectId: id },
      });
    }

    // Delete project team associations
    if (project.projectTeams.length > 0) {
      await tx.projectTeam.deleteMany({
        where: { projectId: id },
      });
    }

    const result = await tx.project.delete({
      where: { id },
      include: {
        owner: {
          include: {
            manager: true,
          },
        },
        tasks: true,
        projectTeams: true,
      },
    });

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to delete!');
    }

    return result;
  });
};

export const ProjectServices = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  updateProjectTeamsById,
  deleteByIdFromDB,
};
