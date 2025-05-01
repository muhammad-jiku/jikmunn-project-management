import { Team } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';

const insertIntoDB = async (payload: Team): Promise<Team> => {
  console.log('first project..', payload);
  // Verify team owner exists
  return await prisma.$transaction(async (tx) => {
    // Check if project owner exists
    const ownerExists = await tx.user.findUnique({
      where: {
        userId: payload?.teamOwnerId,
        role: 'MANAGER',
      },
    });

    console.log('existed owner', ownerExists);
    if (!ownerExists) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Team owner must be a manager and must exist!'
      );
    }

    // // Ensure the auto-increment sequence for tblteam is set correctly
    // await tx.$executeRaw`
    //   SELECT setval(
    //     pg_get_serial_sequence('tblteam', 'id'),
    //     (SELECT COALESCE(MAX(id), 0) FROM tblteam) + 1
    //   )
    // `;

    const result = await tx.team.create({
      data: payload,
      include: {
        owner: {
          include: {
            manager: true,
          },
        },
        members: true,
        projectTeams: true,
      },
    });

    console.log('result team', result);
    if (!result) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create team!'
      );
    }

    return result;
  });
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<Team[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const teams = await prisma.team.findMany({
    skip,
    take: limit,
    include: {
      owner: {
        include: {
          manager: true,
        },
      },
      members: true,
      projectTeams: true,
    },
  });

  const total = await prisma.team.count();

  return {
    meta: { total, page, limit },
    data: teams,
  };
};

const getByIdFromDB = async (id: number): Promise<Team | null> => {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      owner: {
        include: {
          manager: true,
        },
      },
      members: true,
      projectTeams: true,
    },
  });

  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found!');
  }

  return team;
};

const updateOneInDB = async (
  id: number,
  payload: Partial<Team>
): Promise<Team> => {
  // If updating owner, verify new owner exists and is a manager
  if (payload.teamOwnerId) {
    const ownerExists = await prisma.user.findUnique({
      where: {
        userId: payload.teamOwnerId as string,
        role: 'MANAGER',
      },
    });

    if (!ownerExists) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'New team owner must be a manager and must exist!'
      );
    }
  }

  return await prisma.team.update({
    where: { id },
    data: payload,
    include: {
      owner: {
        include: {
          manager: true,
        },
      },
      members: true,
      projectTeams: true,
    },
  });
};

const deleteByIdFromDB = async (id: number): Promise<Team | null> => {
  return await prisma.$transaction(async (tx) => {
    // Delete associated team members
    await tx.teamMember.deleteMany({
      where: { teamId: id },
    });

    // Delete associated project teams
    await tx.projectTeam.deleteMany({
      where: { teamId: id },
    });

    // Delete the team
    return await tx.team.delete({
      where: { id },
    });
  });
};

export const TeamServices = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
