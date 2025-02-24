import { Manager, Prisma } from '@prisma/client';
import cloudinary, { UploadApiResponse } from 'cloudinary';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { validateBase64Image } from '../user/user.utils';
import { managerSearchableFields } from './manager.constants';
import { IManagerFilterRequest } from './manager.interfaces';

// Get all managers
const getAllFromDB = async (
  filters: IManagerFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Manager[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: managerSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  const whereConditions: Prisma.ManagerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.manager.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });
  const total = await prisma.manager.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

// Get a single manager by ID
const getByIdFromDB = async (id: string): Promise<Manager | null> => {
  const result = await prisma.manager.findUnique({
    where: {
      managerId: id,
    },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Sorry, the manager does not exist!'
    );
  }

  return result;
};

// Update a manager by ID
const updateOneInDB = async (
  id: string,
  payload: Prisma.ManagerUpdateInput
): Promise<Manager | null> => {
  // First check if the manager exists
  const existingManager = await prisma.manager.findUnique({
    where: { managerId: id },
  });

  if (!existingManager) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Manager not found!');
  }

  // If a new profile image is provided (and not an empty string)
  if (payload.profileImage && payload.profileImage !== '') {
    // If the existing manager has a profile image, destroy it on Cloudinary
    if (
      existingManager.profileImage &&
      typeof existingManager.profileImage === 'object'
    ) {
      const imageId = (existingManager.profileImage as any).public_id;
      if (imageId) {
        await cloudinary.v2.uploader.destroy(imageId);
      }
    }

    // Validate the new base64 image (throws error if invalid)
    const isValidImage = await validateBase64Image(
      payload.profileImage as string
    );
    console.log('validate base image result:', isValidImage);
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

    // Update the manager record with the new profile image details
    const result = await prisma.manager.update({
      where: { managerId: id },
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
  }

  // If no new image is provided, update without changing the profile image
  const result = await prisma.manager.update({
    where: { managerId: id },
    data: payload,
  });

  if (!result) {
    throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
  }

  return result;
};

// Delete a manager by ID
const deleteByIdFromDB = async (id: string): Promise<Manager | null> => {
  return await prisma.$transaction(async (tx) => {
    // Find the manager by managerId, including the related user
    const manager = await tx.manager.findUnique({
      where: { managerId: id },
      include: { user: true },
    });

    if (!manager) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Sorry, the manager does not exist!'
      );
    }

    // If a profile image exists and is an object, attempt to destroy the image on Cloudinary
    if (manager.profileImage && typeof manager.profileImage === 'object') {
      const imageId = (manager.profileImage as any).public_id;
      if (imageId) {
        await cloudinary.v2.uploader.destroy(imageId);
      }
    }

    // If there is an associated user, delete it as well
    if (manager.user) {
      await tx.user.delete({
        where: { userId: manager.user.userId },
      });
    }

    // Delete the manager record
    const result = await tx.manager.delete({
      where: { managerId: id },
    });

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to delete!');
    }

    return result;
  });
};

export const ManagerServices = {
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
