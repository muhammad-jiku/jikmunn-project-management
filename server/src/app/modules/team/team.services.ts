import { Team } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';

const insertIntoDB = async (payload: Team): Promise<Team> => {
  // Verify team owner exists
  const ownerExists = await prisma.user.findUnique({
    where: {
      userId: payload.teamOwnerId,
      role: 'MANAGER',
    },
  });

  if (!ownerExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Team owner must be a manager and must exist!'
    );
  }

  return await prisma.team.create({
    data: payload,
    include: {
      owner: true,
      members: true,
      projectTeams: true,
    },
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
      owner: true,
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
      owner: true,
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
      owner: true,
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
