import { Team } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';

const insertIntoDB = async (payload: Team): Promise<Team> => {
  try {
    const newTeam = await prisma.team.create({
      data: payload,
    });

    return newTeam;
  } catch (error) {
    console.error('Error creating team:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create team!'
    );
  }
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<Team[]>> => {
  try {
    const { limit, page, skip } =
      paginationHelpers.calculatePagination(options);
    const teams = await prisma.team.findMany({ skip, take: limit });

    const teamsWithUsernames = await Promise.all(
      teams.map(async (team: Team) => {
        const productOwner = await prisma.user.findUnique({
          where: { userId: team.productOwnerUserId! },
          select: { username: true },
        });

        const projectManager = await prisma.user.findUnique({
          where: { userId: team.projectManagerUserId! },
          select: { username: true },
        });

        return {
          ...team,
          productOwnerUsername: productOwner?.username,
          projectManagerUsername: projectManager?.username,
        };
      })
    );

    const total = await prisma.team.count({});

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: teamsWithUsernames,
    };
  } catch (error) {
    console.error('Error retrieving teams:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve teams!'
    );
  }
};

const getByIdFromDB = async (id: number): Promise<Team | null> => {
  const team = await prisma.team.findUnique({
    where: { id },
  });

  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found!');
  }

  return team;
};

const updateIntoDB = async (
  id: number,
  payload: Partial<Team>
): Promise<Team> => {
  try {
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: payload,
    });

    if (!updatedTeam) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Failed to update the team. Team may not exist!'
      );
    }

    return updatedTeam;
  } catch (error) {
    console.error('Error updating team:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update team!'
    );
  }
};

const deleteFromDB = async (id: number): Promise<Team | null> => {
  try {
    const deletedTeam = await prisma.team.delete({
      where: { id },
    });

    return deletedTeam;
  } catch (error) {
    console.error('Error deleting team:', error);
    throw new ApiError(
      httpStatus.CONFLICT,
      'Failed to delete the team. It may not exist!'
    );
  }
};

export const TeamServices = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};
