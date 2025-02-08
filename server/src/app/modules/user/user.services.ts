import {
  Admin,
  Developer,
  Manager,
  SuperAdmin,
  User,
  UserRole,
} from '@prisma/client';
import { Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/handleApiError';
import { jwtHelpers } from '../../../helpers/jwt';
import { prisma } from '../../../shared/prisma';
import { AuthResponse } from '../auth/auth.interfaces';
import { AuthServices } from '../auth/auth.services';
import { createEmailVerificationToken, hashPassword } from '../auth/auth.utils';
import {
  generateAdminId,
  generateDeveloperId,
  generateManagerId,
  generateSuperAdminId,
} from './user.utils';

// Developer creation
const insertDeveloperIntoDB = async (
  developerData: Developer,
  userData: User,
  res: Response
): Promise<AuthResponse> => {
  if (!userData.password) {
    userData.password = config.default.developer_pass as string;
  }

  // Hash the password before saving
  userData.password = await hashPassword(userData.password);
  userData.role = UserRole.DEVELOPER;
  userData.username = userData.username;
  userData.email = userData.email;

  try {
    // Generate verification token using existing utility pattern
    const { verificationToken, hashedToken } = createEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
        emailVerificationToken: hashedToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    console.log('Developer created', newDeveloper);
    console.log('User created:', newUser);

    // Generate tokens using jwt helpers
    const accessToken = jwtHelpers.createToken(
      {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.secret as Secret,
      config.jwt.expires_in as string
    );

    const refreshToken = jwtHelpers.createToken(
      {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.refresh_secret as Secret,
      config.jwt.refresh_expires_in as string
    );

    // Set cookies
    AuthServices.setAuthCookies(res, accessToken, refreshToken);

    // Send verification email
    await AuthServices.sendVerificationEmail(newUser.email, verificationToken);

    console.log('developer tokens...', { accessToken, refreshToken });
    return {
      accessToken,
      refreshToken,
      needsEmailVerification: true,
    };
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
  userData: User,
  res: Response
): Promise<AuthResponse> => {
  const { verificationToken, hashedToken } = createEmailVerificationToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (!userData.password) {
    userData.password = config.default.manager_pass as string;
  }

  // Hash the password before saving
  userData.password = await hashPassword(userData.password);
  userData.role = UserRole.MANAGER;
  userData.username = userData.username;
  userData.email = userData.email;

  try {
    // Generate verification token using existing utility pattern
    const { verificationToken, hashedToken } = createEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
        emailVerificationToken: hashedToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    console.log('manager created', newManager);
    console.log('User created:', newUser);

    // Generate tokens using jwt helpers
    const accessToken = jwtHelpers.createToken(
      {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.secret as Secret,
      config.jwt.expires_in as string
    );

    const refreshToken = jwtHelpers.createToken(
      {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.refresh_secret as Secret,
      config.jwt.refresh_expires_in as string
    );

    // Set cookies
    AuthServices.setAuthCookies(res, accessToken, refreshToken);

    // Send verification email
    await AuthServices.sendVerificationEmail(newUser.email, verificationToken);

    console.log('manager tokens...', { accessToken, refreshToken });
    return {
      accessToken,
      refreshToken,
      needsEmailVerification: true,
    };
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
  userData: User,
  res: Response
): Promise<AuthResponse> => {
  if (!userData.password) {
    userData.password = config.default.admin_pass as string;
  }

  // Hash the password before saving
  userData.password = await hashPassword(userData.password);
  userData.role = UserRole.ADMIN;
  userData.username = userData.username;
  userData.email = userData.email;

  try {
    // Generate verification token using existing utility pattern
    const { verificationToken, hashedToken } = createEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
        emailVerificationToken: hashedToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    console.log('admin created', newAdmin);
    console.log('User created:', newUser);

    // Generate tokens using jwt helpers
    const accessToken = jwtHelpers.createToken(
      {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.secret as Secret,
      config.jwt.expires_in as string
    );

    const refreshToken = jwtHelpers.createToken(
      {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.refresh_secret as Secret,
      config.jwt.refresh_expires_in as string
    );

    // Set cookies
    AuthServices.setAuthCookies(res, accessToken, refreshToken);

    // Send verification email
    await AuthServices.sendVerificationEmail(newUser.email, verificationToken);

    console.log('admins tokens...', { accessToken, refreshToken });
    return {
      accessToken,
      refreshToken,
      needsEmailVerification: true,
    };
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
  userData: User,
  res: Response
): Promise<AuthResponse> => {
  if (!userData.password) {
    userData.password = config.default.super_admin_pass as string;
  }

  // Hash the password before saving
  userData.password = await hashPassword(userData.password);
  userData.role = UserRole.SUPER_ADMIN;
  userData.username = userData.username;
  userData.email = userData.email;

  try {
    // Generate verification token using existing utility pattern
    const { verificationToken, hashedToken } = createEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
        emailVerificationToken: hashedToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    console.log('super admin created', newSuperAdmin);
    console.log('User created:', newUser);

    // Generate tokens using jwt helpers
    const accessToken = jwtHelpers.createToken(
      {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.secret as Secret,
      config.jwt.expires_in as string
    );

    const refreshToken = jwtHelpers.createToken(
      {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.refresh_secret as Secret,
      config.jwt.refresh_expires_in as string
    );

    // Set cookies
    AuthServices.setAuthCookies(res, accessToken, refreshToken);

    // Send verification email
    await AuthServices.sendVerificationEmail(newUser.email, verificationToken);

    console.log('super admin tokens...', { accessToken, refreshToken });
    return {
      accessToken,
      refreshToken,
      needsEmailVerification: true,
    };
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
