import {
  Admin,
  Developer,
  Manager,
  SuperAdmin,
  User,
  UserRole,
} from '@prisma/client';
import httpStatus from 'http-status';
import config from '../../../config';
import ApiError from '../../../errors/handleApiError';
import { prisma } from '../../../shared/prisma';
import { hashPassword } from '../auth/auth.utils';
import {
  generateAdminId,
  generateDeveloperId,
  generateManagerId,
  generateSuperAdminId,
} from './user.utils';

// Developer creation
const insertDeveloperIntoDB = async (
  developerData: Developer,
  userData: User
): Promise<User | null> => {
  if (!userData.password) {
    userData.password = config.default.developer_pass as string;
  }

  // Hash the password before saving
  userData.password = await hashPassword(userData.password);
  userData.role = UserRole.DEVELOPER;
  userData.username = userData.username;
  userData.email = userData.email;

  try {
    // Step 1: Generate a unique developer ID
    const developerId = await generateDeveloperId();
    developerData.developerId = developerId;
    console.log('developerId: ', developerId);
    // Step 2: Create Developer first to ensure the developerId exists
    const newDeveloper = await prisma.developer.create({
      data: {
        ...developerData,
      },
    });

    // Step 3: Now create the User with the new developerId
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        userId: newDeveloper.developerId, // Set userId to match developerId
        developerId: newDeveloper.developerId, // Link to the newly created Developer
      },
    });

    console.log('Developer created', newDeveloper);
    console.log('User created:', newUser);

    return newUser;
  } catch (error) {
    console.error('Error during user creation:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user profile'
    );
  }
};

// Manager creation
const insertManagerIntoDB = async (
  managerData: Manager,
  userData: User
): Promise<User | null> => {
  if (!userData.password) {
    userData.password = config.default.manager_pass as string;
  }

  // Hash the password before saving
  userData.password = await hashPassword(userData.password);
  userData.role = UserRole.MANAGER;
  userData.username = userData.username;
  userData.email = userData.email;

  try {
    // Step 1: Generate a unique manager ID
    const managerId = await generateManagerId();
    managerData.managerId = managerId;
    console.log('managerId: ', managerId);
    // Step 2: Create Manager first to ensure the managerId exists
    const newManager = await prisma.manager.create({
      data: {
        ...managerData,
      },
    });

    // Step 3: Now create the User with the new managerId
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        userId: newManager.managerId, // Set userId to match managerId
        managerId: newManager.managerId, // Link to the newly created manager
      },
    });

    console.log('manager created', newManager);
    console.log('User created:', newUser);

    return newUser;
  } catch (error) {
    console.error('Error during user creation:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user profile'
    );
  }
};

// Admin creation
const insertAdminIntoDB = async (
  adminData: Admin,
  userData: User
): Promise<User | null> => {
  if (!userData.password) {
    userData.password = config.default.admin_pass as string;
  }

  // Hash the password before saving
  userData.password = await hashPassword(userData.password);
  userData.role = UserRole.ADMIN;
  userData.username = userData.username;
  userData.email = userData.email;

  try {
    // Step 1: Generate a unique admin ID
    const adminId = await generateAdminId();
    adminData.adminId = adminId;
    console.log('adminId: ', adminId);
    // Step 2: Create Admin first to ensure the adminId exists
    const newAdmin = await prisma.admin.create({
      data: {
        ...adminData,
      },
    });

    // Step 3: Now create the User with the new adminId
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        userId: newAdmin.adminId, // Set userId to match adminId
        adminId: newAdmin.adminId, // Link to the newly created admin
      },
    });

    console.log('admin created', newAdmin);
    console.log('User created:', newUser);

    return newUser;
  } catch (error) {
    console.error('Error during user creation:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user profile'
    );
  }
};

// Super Admin creation
const insertSuperAdminIntoDB = async (
  superAdminData: SuperAdmin,
  userData: User
): Promise<User | null> => {
  if (!userData.password) {
    userData.password = config.default.super_admin_pass as string;
  }

  // Hash the password before saving
  userData.password = await hashPassword(userData.password);
  userData.role = UserRole.SUPER_ADMIN;
  userData.username = userData.username;
  userData.email = userData.email;

  try {
    // Step 1: Generate a unique superAdmin ID
    const superAdminId = await generateSuperAdminId();
    superAdminData.superAdminId = superAdminId;
    console.log('superAdminId: ', superAdminId);
    // Step 2: Create Super Admin first to ensure the superAdminId exists
    const newSuperAdmin = await prisma.superAdmin.create({
      data: {
        ...superAdminData,
      },
    });

    // Step 3: Now create the User with the new superAdminId
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        userId: newSuperAdmin.superAdminId, // Set userId to match superAdminId
        superAdminId: newSuperAdmin.superAdminId, // Link to the newly created super admin
      },
    });

    console.log('super admin created', newSuperAdmin);
    console.log('User created:', newUser);

    return newUser;
  } catch (error) {
    console.error('Error during user creation:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user profile'
    );
  }
};

export const UserServices = {
  insertDeveloperIntoDB,
  insertManagerIntoDB,
  insertAdminIntoDB,
  insertSuperAdminIntoDB,
};
