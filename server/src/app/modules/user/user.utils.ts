import { UserRole } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { executeSafeQuery } from '../../../lib/transactionManager';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB in bytes
const MAX_BASE64_LENGTH = Math.ceil((MAX_FILE_SIZE_BYTES * 4) / 3);

export const validateBase64Image = async (
  base64String: string
): Promise<boolean> => {
  // Remove any data URL prefix if present.
  const parts = await base64String.split(',');
  const base64Data = parts.length > 1 ? parts[1] : parts[0];

  if (base64String.length > MAX_BASE64_LENGTH) {
    // Instead of throwing an error, return false.
    return false;
  }
  return true;
};

export const findLastDeveloperId = async (): Promise<string | undefined> => {
  const lastDeveloper = await executeSafeQuery(() =>
    prisma.user.findFirst({
      where: {
        role: UserRole.DEVELOPER, // Correct usage with enum
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        developerId: true,
      },
    })
  );

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
  const lastManager = await executeSafeQuery(() =>
    prisma.user.findFirst({
      where: {
        role: UserRole.MANAGER, // Correct usage with enum
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        managerId: true,
      },
    })
  );

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
  const lastAdmin = await executeSafeQuery(() =>
    prisma.user.findFirst({
      where: {
        role: UserRole.ADMIN, // Correct usage with enum
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        adminId: true,
      },
    })
  );

  return lastAdmin?.adminId ? lastAdmin?.adminId.substring(2) : undefined;
};

export const generateAdminId = async (): Promise<string> => {
  const currentId = (await findLastAdminId()) || '00000';
  let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, '0');
  incrementedId = `A-${incrementedId}`;

  return incrementedId;
};

export const findLastSuperAdminId = async (): Promise<string | undefined> => {
  const lastSuperAdmin = await executeSafeQuery(() =>
    prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN, // Correct usage with enum
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        superAdminId: true,
      },
    })
  );

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
