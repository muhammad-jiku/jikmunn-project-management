import { ProjectTeam } from '@prisma/client';
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

const insertIntoDB = async (payload: ProjectTeam) => {
  return await executeSafeTransaction(async (tx) => {
    // Check if project exists
    const project = await tx.project.findUnique({
      where: { id: payload.projectId },
    });

    if (!project) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
    }

    // Check if team exists
    const team = await tx.team.findUnique({
      where: { id: payload.teamId },
      include: { members: true },
    });

    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
    }

    // Check if project team already exists
    const existingProjectTeam = await tx.projectTeam.findFirst({
      where: {
        projectId: payload.projectId,
        teamId: payload.teamId,
      },
    });

    if (existingProjectTeam) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Team is already assigned to this project'
      );
    }

    // Ensure the auto-increment sequence for tblprojectteam is set correctly
    await tx.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('tblprojectteam', 'id'),
        (SELECT COALESCE(MAX(id), 0) FROM tblprojectteam) + 1
      )
    `;

    // Create project team assignment
    const projectTeam = await tx.projectTeam.create({
      data: payload,
      include: {
        project: true,
        team: {
          include: {
            members: true,
            owner: true,
          },
        },
      },
    });

    return projectTeam;
  });
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<ProjectTeam[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const [projectTeams, total] = await Promise.all([
    executeSafeQuery(() =>
      prisma.projectTeam.findMany({
        skip,
        take: limit,
        include: {
          project: true,
          team: {
            include: {
              members: true,
              owner: true,
            },
          },
        },
      })
    ),
    executeSafeQuery(() => prisma.projectTeam.count()),
  ]);

  return {
    meta: { total, page, limit },
    data: projectTeams,
  };
};

const getByIdFromDB = async (id: number) => {
  const projectTeam = await executeSafeQuery(() =>
    prisma.projectTeam.findUnique({
      where: { id },
      include: {
        project: true,
        team: {
          include: {
            members: true,
            owner: true,
          },
        },
      },
    })
  );

  if (!projectTeam) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Project team assignment not found'
    );
  }

  return projectTeam;
};

const getByProjectIdFromDB = async (projectId: number) => {
  const projectTeams = await executeSafeQuery(() =>
    prisma.projectTeam.findMany({
      where: { projectId },
      include: {
        team: {
          include: {
            members: true,
            owner: true,
          },
        },
      },
    })
  );

  return projectTeams;
};

const getByTeamIdFromDB = async (teamId: number) => {
  const projectTeams = await executeSafeQuery(() =>
    prisma.projectTeam.findMany({
      where: { teamId },
      include: {
        project: true,
      },
    })
  );

  return projectTeams;
};

const updateOneInDB = async (id: number, payload: Partial<ProjectTeam>) => {
  return await executeSafeTransaction(async (tx) => {
    // Check if project team exists
    const existingProjectTeam = await tx.projectTeam.findUnique({
      where: { id },
    });

    if (!existingProjectTeam) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Project team assignment not found'
      );
    }

    // If updating project ID, check if new project exists
    if (payload.projectId) {
      const newProject = await tx.project.findUnique({
        where: { id: payload.projectId },
      });

      if (!newProject) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
      }

      // Check if the team is already assigned to the new project
      const duplicateProjectTeam = await tx.projectTeam.findFirst({
        where: {
          projectId: payload.projectId,
          teamId: existingProjectTeam.teamId,
          id: { not: id },
        },
      });

      if (duplicateProjectTeam) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Team is already assigned to the new project'
        );
      }
    }

    // If updating team ID, check if new team exists
    if (payload.teamId) {
      const newTeam = await tx.team.findUnique({
        where: { id: payload.teamId },
      });

      if (!newTeam) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
      }

      // Check if the new team is already assigned to the project
      const duplicateProjectTeam = await tx.projectTeam.findFirst({
        where: {
          projectId: existingProjectTeam.projectId,
          teamId: payload.teamId,
          id: { not: id },
        },
      });

      if (duplicateProjectTeam) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'New team is already assigned to this project'
        );
      }
    }

    // Update project team assignment
    return await tx.projectTeam.update({
      where: { id },
      data: payload,
      include: {
        project: true,
        team: {
          include: {
            members: true,
            owner: true,
          },
        },
      },
    });
  });
};

const deleteByIdFromDB = async (id: number) => {
  return await executeSafeTransaction(async (tx) => {
    // Check if project team exists
    const projectTeam = await tx.projectTeam.findUnique({
      where: { id },
    });

    if (!projectTeam) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Project team assignment not found'
      );
    }

    // Delete project team assignment
    return await tx.projectTeam.delete({
      where: { id },
    });
  });
};

export const ProjectTeamServices = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  getByProjectIdFromDB,
  getByTeamIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
