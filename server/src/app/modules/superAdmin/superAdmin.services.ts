import { Prisma, SuperAdmin } from '@prisma/client';
import cloudinary, { UploadApiResponse } from 'cloudinary';
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
import { validateBase64Image } from '../user/user.utils';
import { superAdminSearchableFields } from './superAdmin.constants';
import { ISuperAdminFilterRequest } from './superAdmin.interfaces';

// Get all super admins
const getAllFromDB = async (
  filters: ISuperAdminFilterRequest,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<SuperAdmin[]>> => {
  const { searchTerm, ...filterData } = filters;
  const { page, limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions: Prisma.SuperAdminWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: superAdminSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: {
          equals: value,
        },
      })),
    });
  }

  const whereConditions: Prisma.SuperAdminWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Use safe query wrapper for both data fetch and count
  const [superAdmins, total] = await Promise.all([
    executeSafeQuery(() =>
      prisma.superAdmin.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
          paginationOptions.sortBy && paginationOptions.sortOrder
            ? { [paginationOptions.sortBy]: paginationOptions.sortOrder }
            : undefined,
      })
    ),
    executeSafeQuery(() => prisma.superAdmin.count({ where: whereConditions })),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: superAdmins,
  };
};

// Get a single super admin by ID
const getByIdFromDB = async (id: string): Promise<SuperAdmin | null> => {
  const result = await executeSafeQuery(() =>
    prisma.superAdmin.findUnique({
      where: { superAdminId: id },
    })
  );

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Sorry, the super admin does not exist!'
    );
  }

  return result;
};

// Update a super admin by ID
const updateOneInDB = async (
  id: string,
  payload: Prisma.SuperAdminUpdateInput
): Promise<SuperAdmin | null> => {
  return await executeSafeTransaction(async (tx) => {
    // First check if the superAdmin exists
    const existingsuperAdmin = await tx.superAdmin.findUnique({
      where: { superAdminId: id },
    });

    if (!existingsuperAdmin) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Super admin not found!');
    }

    // If a new profile image is provided (and not an empty string)
    if (
      payload.profileImage &&
      typeof payload.profileImage === 'string' &&
      payload.profileImage.startsWith('data:image')
    ) {
      // If the existing super admin has a profile image, destroy it on Cloudinary
      if (
        existingsuperAdmin.profileImage &&
        typeof existingsuperAdmin.profileImage === 'object'
      ) {
        const imageId = (existingsuperAdmin.profileImage as any).public_id;
        if (imageId) {
          await cloudinary.v2.uploader.destroy(imageId);
        }
      }

      // Validate the new base64 image (throws error if invalid)
      const isValidImage = await validateBase64Image(
        payload.profileImage as string
      );

      if (!isValidImage) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Image file is too large. Maximum allowed size is 2 MB.'
        );
      }

      // Upload the new image
      const myCloud: UploadApiResponse = await cloudinary.v2.uploader.upload(
        payload.profileImage as string,
        {
          folder: 'jikmunn-project-management/avatars',
          width: 150,
          crop: 'scale',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png'],
          transformation: [{ quality: 'auto' }],
          use_filename: true,
          unique_filename: false,
          overwrite: true,
          chunk_size: 6000000, // 6MB chunks for large uploads
          timeout: 60000, // 60 seconds timeout
          invalidate: true, // Ensure old cached versions are replaced
        }
      );

      // Update the super admin record with the new profile image details
      const result = await tx.superAdmin.update({
        where: { superAdminId: id },
        data: {
          ...payload,
          profileImage: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
        },
      });

      if (!result) {
        throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
      }

      return result;
    } else {
      // If profileImage is in the payload but is not a base64 string,
      // remove it to prevent unwanted updates to the existing image
      if (payload.profileImage) {
        delete payload.profileImage;
      }
    }

    // If no new image is provided, update without changing the profile image
    const result = await tx.superAdmin.update({
      where: { superAdminId: id },
      data: payload,
    });

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
    }

    return result;
  });
};

// Delete a super admin by ID
const deleteByIdFromDB = async (id: string): Promise<SuperAdmin | null> => {
  return await executeSafeTransaction(async (tx) => {
    // Find the super admin by superAdminId, including the related user
    const superAdmin = await tx.superAdmin.findUnique({
      where: {
        superAdminId: id,
      },
      include: {
        user: true,
      },
    });

    if (!superAdmin) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Sorry, the super admin does not exist!'
      );
    }

    // If a profile image exists and is an object, attempt to destroy the image on Cloudinary
    if (
      superAdmin.profileImage &&
      typeof superAdmin.profileImage === 'object'
    ) {
      const imageId = (superAdmin.profileImage as any).public_id;
      if (imageId) {
        await cloudinary.v2.uploader.destroy(imageId);
      }
    }

    // If there is an associated user, delete it as well
    if (superAdmin.user) {
      await tx.user.delete({
        where: { userId: superAdmin.user.userId },
      });
    }

    // Delete the superAdmin record
    const result = await tx.superAdmin.delete({
      where: { superAdminId: id },
    });

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to delete!');
    }

    return result;
  });
};

export const SuperAdminServices = {
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
