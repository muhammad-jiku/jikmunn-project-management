import { UserRole } from '@prisma/client';
import { prisma } from '../../../shared/prisma';

export const findLastDeveloperId = async (): Promise<string | undefined> => {
  const lastDeveloper = await prisma.user.findFirst({
    where: {
      role: UserRole.DEVELOPER, // Correct usage with enum
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      developerId: true,
    },
  });

  return lastDeveloper?.developerId
    ? lastDeveloper?.developerId.substring(2)
    : undefined;
};

export const generateDeveloperId = async (): Promise<string> => {
  const currentId = (await findLastDeveloperId()) || '00000';
  let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, '0');
  incrementedId = `D-${incrementedId}`;

  return incrementedId;
};

export const findLastManagerId = async (): Promise<string | undefined> => {
  const lastManager = await prisma.user.findFirst({
    where: {
      role: UserRole.MANAGER, // Correct usage with enum
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      managerId: true,
    },
  });

  return lastManager?.managerId
    ? lastManager?.managerId.substring(2)
    : undefined;
};

export const generateManagerId = async (): Promise<string> => {
  const currentId = (await findLastManagerId()) || '00000';
  let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, '0');
  incrementedId = `M-${incrementedId}`;

  return incrementedId;
};

export const findLastAdminId = async (): Promise<string | undefined> => {
  const lastAdmin = await prisma.user.findFirst({
    where: {
      role: UserRole.ADMIN, // Correct usage with enum
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      adminId: true,
    },
  });

  return lastAdmin?.adminId ? lastAdmin?.adminId.substring(2) : undefined;
};

export const generateAdminId = async (): Promise<string> => {
  const currentId = (await findLastAdminId()) || '00000';
  let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, '0');
  incrementedId = `A-${incrementedId}`;

  return incrementedId;
};

export const findLastSuperAdminId = async (): Promise<string | undefined> => {
  const lastSuperAdmin = await prisma.user.findFirst({
    where: {
      role: UserRole.SUPER_ADMIN, // Correct usage with enum
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      superAdminId: true,
    },
  });

  return lastSuperAdmin?.superAdminId
    ? lastSuperAdmin?.superAdminId.substring(3)
    : undefined;
};

export const generateSuperAdminId = async (): Promise<string> => {
  const currentId = (await findLastSuperAdminId()) || '00000';
  let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, '0');
  incrementedId = `SA-${incrementedId}`;

  return incrementedId;
};
