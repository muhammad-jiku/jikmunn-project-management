import { Developer, Prisma } from '@prisma/client';
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
import { developerSearchableFields } from './developer.constants';
import { IDeveloperFilterRequest } from './developer.interfaces';

// Get all developers
const getAllFromDB = async (
  filters: IDeveloperFilterRequest,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<Developer[]>> => {
  const { searchTerm, ...filterData } = filters;
  const { page, limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions: Prisma.DeveloperWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: developerSearchableFields.map((field) => ({
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

  const whereConditions: Prisma.DeveloperWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Use safe query wrapper for both data fetch and count
  const [developers, total] = await Promise.all([
    executeSafeQuery(() =>
      prisma.developer.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
          paginationOptions.sortBy && paginationOptions.sortOrder
            ? { [paginationOptions.sortBy]: paginationOptions.sortOrder }
            : undefined,
      })
    ),
    executeSafeQuery(() => prisma.developer.count({ where: whereConditions })),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: developers,
  };
};

// Get a single developer by ID
const getByIdFromDB = async (id: string): Promise<Developer | null> => {
  const result = await executeSafeQuery(() =>
    prisma.developer.findUnique({
      where: { developerId: id },
    })
  );

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Sorry, the developer does not exist!'
    );
  }

  return result;
};

// Update a developer by ID
const updateOneInDB = async (
  id: string,
  payload: Prisma.DeveloperUpdateInput
): Promise<Developer | null> => {
  return await executeSafeTransaction(async (tx) => {
    // First check if the developer exists
    const existingDeveloper = await tx.developer.findUnique({
      where: { developerId: id },
    });

    if (!existingDeveloper) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Developer not found!');
    }

    // If a new profile image is provided (and not an empty string)
    if (
      payload.profileImage &&
      typeof payload.profileImage === 'string' &&
      payload.profileImage.startsWith('data:image')
    ) {
      // If the existing developer has a profile image, destroy it on Cloudinary
      if (
        existingDeveloper.profileImage &&
        typeof existingDeveloper.profileImage === 'object'
      ) {
        const imageId = (existingDeveloper.profileImage as any).public_id;
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

      // Update the developer record with the new profile image details
      const result = await tx.developer.update({
        where: { developerId: id },
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
    const result = await tx.developer.update({
      where: { developerId: id },
      data: payload,
    });

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
    }

    return result;
  });
};

// Delete a developer by ID
const deleteByIdFromDB = async (id: string): Promise<Developer | null> => {
  return await executeSafeTransaction(async (tx) => {
    // Find the developer by developerId, including the related user
    const developer = await tx.developer.findUnique({
      where: {
        developerId: id,
      },
      include: {
        user: true,
      },
    });

    if (!developer) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Sorry, the developer does not exist!'
      );
    }

    // If a profile image exists and is an object, attempt to destroy the image on Cloudinary
    if (developer.profileImage && typeof developer.profileImage === 'object') {
      const imageId = (developer.profileImage as any).public_id;
      if (imageId) {
        await cloudinary.v2.uploader.destroy(imageId);
      }
    }

    // If there is an associated user, delete it as well
    if (developer.user) {
      await tx.user.delete({
        where: { userId: developer.user.userId },
      });
    }

    // Delete the developer record
    const result = await tx.developer.delete({
      where: { developerId: id },
    });

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to delete!');
    }

    return result;
  });
};

export const DeveloperServices = {
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
