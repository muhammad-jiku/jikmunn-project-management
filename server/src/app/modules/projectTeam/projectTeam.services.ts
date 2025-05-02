import { ProjectTeam } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';

const insertIntoDB = async (payload: ProjectTeam) => {
  const [proj, team] = await Promise.all([
    prisma.project.findUnique({ where: { id: payload.projectId } }),
    prisma.team.findUnique({ where: { id: payload.teamId } }),
  ]);
  if (!proj || !team)
    throw new ApiError(httpStatus.NOT_FOUND, 'Project or Team not found');
  return prisma.projectTeam.create({ data: payload });
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<ProjectTeam[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const data = await prisma.projectTeam.findMany({
    skip,
    take: limit,
    include: { project: true, team: true },
  });
  const total = await prisma.projectTeam.count();
  return { meta: { total, page, limit }, data };
};

const getByIdFromDB = async (id: number) => {
  const item = await prisma.projectTeam.findUnique({
    where: { id },
    include: { project: true, team: true },
  });
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  return item;
};

const updateOneInDB = async (id: number, payload: Partial<ProjectTeam>) => {
  return prisma.projectTeam.update({ where: { id }, data: payload });
};

const deleteByIdFromDB = async (id: number) =>
  prisma.projectTeam.delete({ where: { id } });

export const ProjectTeamServices = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
