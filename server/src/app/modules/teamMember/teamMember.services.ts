import { TeamMember } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';

const insertIntoDB = async (payload: TeamMember) => {
  return await prisma.$transaction(async (tx) => {
    // Check if user exists
    const user = await tx.user.findUnique({
      where: { userId: payload.userId },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if team exists
    const team = await tx.team.findUnique({
      where: { id: payload.teamId },
    });

    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
    }

    // Check if user is already a member of the team
    const existingMember = await tx.teamMember.findFirst({
      where: {
        teamId: payload.teamId,
        userId: payload.userId,
      },
    });

    if (existingMember) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'User is already a member of this team'
      );
    }

    // Create team member
    const teamMember = await tx.teamMember.create({
      data: payload,
      include: {
        team: true,
        user: true,
      },
    });

    return teamMember;
  });
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<TeamMember[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const teamMembers = await prisma.teamMember.findMany({
    skip,
    take: limit,
    include: {
      team: true,
      user: true,
    },
  });

  const total = await prisma.teamMember.count();

  return {
    meta: { total, page, limit },
    data: teamMembers,
  };
};

const getByIdFromDB = async (id: number) => {
  const teamMember = await prisma.teamMember.findUnique({
    where: { id },
    include: {
      team: true,
      user: true,
    },
  });

  if (!teamMember) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team member not found');
  }

  return teamMember;
};

const getByTeamIdFromDB = async (teamId: number) => {
  const teamMembers = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: true,
    },
  });

  return teamMembers;
};

const getByUserIdFromDB = async (userId: string) => {
  const teamMembers = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: true,
    },
  });

  return teamMembers;
};

const updateOneInDB = async (id: number, payload: Partial<TeamMember>) => {
  return await prisma.$transaction(async (tx) => {
    // Check if team member exists
    const existingMember = await tx.teamMember.findUnique({
      where: { id },
      include: { team: true },
    });

    if (!existingMember) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team member not found');
    }

    // If updating user ID, check if new user exists
    if (payload.userId) {
      const newUser = await tx.user.findUnique({
        where: { userId: payload.userId },
      });

      if (!newUser) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      // Check if the user is already a member of the team
      const duplicateMember = await tx.teamMember.findFirst({
        where: {
          teamId: existingMember.teamId,
          userId: payload.userId,
          id: { not: id },
        },
      });

      if (duplicateMember) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'User is already a member of this team'
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

      // Check if the user is already a member of the new team
      const duplicateMember = await tx.teamMember.findFirst({
        where: {
          teamId: payload.teamId,
          userId: existingMember.userId,
          id: { not: id },
        },
      });

      if (duplicateMember) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'User is already a member of the new team'
        );
      }

      // Don't allow removing the team owner
      const team = await tx.team.findUnique({
        where: { id: existingMember.teamId },
      });

      if (team && team.teamOwnerId === existingMember.userId) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Cannot change team for the team owner'
        );
      }
    }

    // Update team member
    return await tx.teamMember.update({
      where: { id },
      data: payload,
      include: {
        team: true,
        user: true,
      },
    });
  });
};

const deleteByIdFromDB = async (id: number) => {
  return await prisma.$transaction(async (tx) => {
    // Check if team member exists
    const teamMember = await tx.teamMember.findUnique({
      where: { id },
      include: { team: true },
    });

    if (!teamMember) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team member not found');
    }

    // Don't allow removing the team owner
    const team = await tx.team.findUnique({
      where: { id: teamMember.teamId },
    });

    if (team && team.teamOwnerId === teamMember.userId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Cannot remove the team owner from the team'
      );
    }

    // Delete team member
    return await tx.teamMember.delete({
      where: { id },
    });
  });
};

export const TeamMemberServices = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  getByTeamIdFromDB,
  getByUserIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
