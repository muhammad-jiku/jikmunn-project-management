import {
  Admin,
  Developer,
  Manager,
  SuperAdmin,
  User,
  UserRole,
} from '@prisma/client';
import cloudinary from 'cloudinary';
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
    const myCloud = await cloudinary.v2.uploader.upload(
      developerData?.profileImage! as string,
      {
        folder: 'jikmunn-project-management/avatars',
        width: 150,
        crop: 'scale',
      }
    );

    const newDeveloper = await prisma.developer.create({
      data: {
        ...developerData,
        profileImage: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
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
    await AuthServices.setAuthCookies(res, accessToken, refreshToken);

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

const insertDeveloperIntoPending = async (
  developerData: Developer,
  userData: User,
  res: Response
): Promise<AuthResponse> => {
  // Use a default password if not provided
  if (!userData.password) {
    userData.password = config.default.developer_pass as string;
  }
  // Hash the password before storing
  userData.password = await hashPassword(userData.password);
  userData.role = UserRole.DEVELOPER;

  try {
    // Generate email verification token
    const { verificationToken, hashedToken } = createEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Generate a unique developer ID and assign it
    const developerId = await generateDeveloperId();
    developerData.developerId = developerId;

    // Upload profile image to Cloudinary
    const myCloud = await cloudinary.v2.uploader.upload(
      developerData?.profileImage! as string,
      {
        folder: 'jikmunn-project-management/avatars',
        width: 150,
        crop: 'scale',
      }
    );

    // Prepare role-specific data (as JSON)
    const profileData = {
      developer: {
        developerId,
        firstName: developerData.firstName,
        lastName: developerData.lastName,
        middleName: developerData.middleName,
        contact: developerData.contact,
        profileImage: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      },
    };

    // Store pending signup data
    await prisma.pendingSignup.create({
      data: {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        password: userData.password,
        profileData,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email
    await AuthServices.sendVerificationEmail(userData.email, verificationToken);

    return {
      accessToken: '', // Tokens are not issued until verification
      refreshToken: '',
      needsEmailVerification: true,
    };
  } catch (error) {
    console.error('Error during pending signup:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to process pending signup'
    );
  }
};

// Manager creation
const insertManagerIntoDB = async (
  managerData: Manager,
  userData: User,
  res: Response
): Promise<AuthResponse> => {
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
    const myCloud = await cloudinary.v2.uploader.upload(
      managerData?.profileImage! as string,
      {
        folder: 'jikmunn-project-management/avatars',
        width: 150,
        crop: 'scale',
      }
    );

    const newManager = await prisma.manager.create({
      data: {
        ...managerData,
        profileImage: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      },
    });

    // Step 3: Now create the User with the new managerId
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        userId: newManager.managerId, // Set userId to match managerId
        managerId: newManager.managerId, // Link to the newly created Manager
        emailVerificationToken: hashedToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    console.log('Manager created', newManager);
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
    const myCloud = await cloudinary.v2.uploader.upload(
      adminData?.profileImage! as string,
      {
        folder: 'jikmunn-project-management/avatars',
        width: 150,
        crop: 'scale',
      }
    );

    const newAdmin = await prisma.admin.create({
      data: {
        ...adminData,
        profileImage: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      },
    });

    // Step 3: Now create the User with the new adminId
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        userId: newAdmin.adminId, // Set userId to match adminId
        adminId: newAdmin.adminId, // Link to the newly created Admin
        emailVerificationToken: hashedToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    console.log('Admin created', newAdmin);
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
    await AuthServices.setAuthCookies(res, accessToken, refreshToken);

    // Send verification email
    await AuthServices.sendVerificationEmail(newUser.email, verificationToken);

    console.log('admin tokens...', { accessToken, refreshToken });
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

    console.log('(2) verification token', verificationToken);
    console.log('(2.1) verification token expires', verificationExpires);

    // Step 1: Generate a unique super admin ID
    const superAdminId = await generateSuperAdminId();
    superAdminData.superAdminId = superAdminId;
    console.log('superAdminId: ', superAdminId);
    // Step 2: Create Super Admin first to ensure the superAdminId exists
    const myCloud = await cloudinary.v2.uploader.upload(
      superAdminData?.profileImage! as string,
      {
        folder: 'jikmunn-project-management/avatars',
        width: 150,
        crop: 'scale',
      }
    );

    const newSuperAdmin = await prisma.superAdmin.create({
      data: {
        ...superAdminData,
        profileImage: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      },
    });

    // Step 3: Now create the User with the new superAdminId
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        userId: newSuperAdmin.superAdminId, // Set userId to match superAdminId
        superAdminId: newSuperAdmin.superAdminId, // Link to the newly created Super Admin
        emailVerificationToken: hashedToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    console.log('Super Admin created', newSuperAdmin);
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
    await AuthServices.setAuthCookies(res, accessToken, refreshToken);

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
  // insertDeveloperIntoDB: insertDeveloperIntoPending,
  insertDeveloperIntoDB,
  insertManagerIntoDB,
  insertAdminIntoDB,
  insertSuperAdminIntoDB,
};
