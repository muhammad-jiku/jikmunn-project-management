import { TeamMember } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';

const insertIntoDB = async (payload: TeamMember) => {
  const [user, team] = await Promise.all([
    prisma.user.findUnique({ where: { userId: payload.userId } }),
    prisma.team.findUnique({ where: { id: payload.teamId } }),
  ]);
  if (!user || !team)
    throw new ApiError(httpStatus.NOT_FOUND, 'User or Team not found');
  return prisma.teamMember.create({ data: payload });
};

const getAllFromDB = async (
  opts: IPaginationOptions
): Promise<IGenericResponse<TeamMember[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(opts);
  const data = await prisma.teamMember.findMany({
    skip,
    take: limit,
    include: { team: true, user: true },
  });
  const total = await prisma.teamMember.count();
  return { meta: { total, page, limit }, data };
};

const getByIdFromDB = async (id: number) => {
  const item = await prisma.teamMember.findUnique({
    where: { id },
    include: { team: true, user: true },
  });
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  return item;
};

const updateOneInDB = async (id: number, payload: Partial<TeamMember>) => {
  return prisma.teamMember.update({ where: { id }, data: payload });
};

const deleteByIdFromDB = async (id: number) =>
  prisma.teamMember.delete({ where: { id } });

export const TeamMemberServices = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
