import { Admin, Prisma } from '@prisma/client';
import cloudinary, { UploadApiResponse } from 'cloudinary';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';
import { validateBase64Image } from '../user/user.utils';
import { adminSearchableFields } from './admin.constants';
import { IAdminFilterRequest } from './admin.interfaces';

// Get all admins
const getAllFromDB = async (
  filters: IAdminFilterRequest,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<Admin[]>> => {
  const { searchTerm, ...filterData } = filters;
  const { page, limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions: Prisma.AdminWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map((field) => ({
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

  const whereConditions: Prisma.AdminWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const admins = await prisma.admin.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      paginationOptions.sortBy && paginationOptions.sortOrder
        ? { [paginationOptions.sortBy]: paginationOptions.sortOrder }
        : undefined,
  });

  const total = await prisma.admin.count({ where: whereConditions });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: admins,
  };
};

// Get a single admin by ID
const getByIdFromDB = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUnique({
    where: { adminId: id },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Sorry, the admin does not exist!'
    );
  }

  return result;
};

// Update a admin by ID
const updateOneInDB = async (
  id: string,
  payload: Prisma.AdminUpdateInput
): Promise<Admin | null> => {
  // First check if the admin exists
  const existingadmin = await prisma.admin.findUnique({
    where: { adminId: id },
  });

  if (!existingadmin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found!');
  }

  // If a new profile image is provided (and not an empty string)
  if (
    payload.profileImage &&
    typeof payload.profileImage === 'string' &&
    payload.profileImage.startsWith('data:image')
  ) {
    // If the existing admin has a profile image, destroy it on Cloudinary
    if (
      existingadmin.profileImage &&
      typeof existingadmin.profileImage === 'object'
    ) {
      const imageId = (existingadmin.profileImage as any).public_id;
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

    // Update the admin record with the new profile image details
    const result = await prisma.admin.update({
      where: { adminId: id },
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
  const result = await prisma.admin.update({
    where: { adminId: id },
    data: payload,
  });

  if (!result) {
    throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to update!');
  }

  return result;
};

// Delete a admin by ID
const deleteByIdFromDB = async (id: string): Promise<Admin | null> => {
  return await prisma.$transaction(async (tx) => {
    // Find the admin by adminId, including the related user
    const admin = await tx.admin.findUnique({
      where: { adminId: id },
      include: { user: true },
    });

    if (!admin) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Sorry, the admin does not exist!'
      );
    }

    // If a profile image exists and is an object, attempt to destroy the image on Cloudinary
    if (admin.profileImage && typeof admin.profileImage === 'object') {
      const imageId = (admin.profileImage as any).public_id;
      if (imageId) {
        await cloudinary.v2.uploader.destroy(imageId);
      }
    }

    // If there is an associated user, delete it as well
    if (admin.user) {
      await tx.user.delete({
        where: { userId: admin.user.userId },
      });
    }

    // Delete the admin record
    const result = await tx.admin.delete({
      where: { adminId: id },
    });

    if (!result) {
      throw new ApiError(httpStatus.CONFLICT, 'Sorry, failed to delete!');
    }

    return result;
  });
};

export const AdminServices = {
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
