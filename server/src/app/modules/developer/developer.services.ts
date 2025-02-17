import { Developer, Prisma } from '@prisma/client';
import cloudinary, { UploadApiResponse } from 'cloudinary';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { validateBase64Image } from '../user/user.utils';
import { developerSearchableFields } from './developer.constants';
import { IDeveloperFilterRequest } from './developer.interfaces';

// Get all developers
const getAllFromDB = async (
  filters: IDeveloperFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Developer[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

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

  const whereConditions: Prisma.DeveloperWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.developer.findMany({
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
  const total = await prisma.developer.count({
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

// Get a single developer by ID
const getByIdFromDB = async (id: string): Promise<Developer | null> => {
  const result = await prisma.developer.findUnique({
    where: {
      developerId: id,
    },
  });

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
  // First check if the developer exists
  const existingDeveloper = await prisma.developer.findUnique({
    where: { developerId: id },
  });

  if (!existingDeveloper) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Developer not found!');
  }

  // If a new profile image is provided (and not an empty string)
  if (payload.profileImage && payload.profileImage !== '') {
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
    validateBase64Image(payload.profileImage as string);

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
    const result = await prisma.developer.update({
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
  }

  // If no new image is provided, update without changing the profile image
  const result = await prisma.developer.update({
    where: { developerId: id },
    data: payload,
  });

  if (!result) {
    throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
  }

  return result;
};

// Delete a developer by ID
const deleteByIdFromDB = async (id: string): Promise<Developer | null> => {
  return await prisma.$transaction(async (tx) => {
    // Find the developer by developerId, including the related user
    const developer = await tx.developer.findUnique({
      where: { developerId: id },
      include: { user: true },
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
