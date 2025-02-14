import { User } from '@prisma/client';
import crypto from 'crypto';
import { Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/handleApiError';
import { EmailHelper } from '../../../helpers/emailSender';
import { jwtHelpers } from '../../../helpers/jwt';
import { prisma } from '../../../shared/prisma';
import {
  IChangePassword,
  IForgotPasswordPayload,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
  IResetPasswordPayload,
} from './auth.interfaces';
import {
  createPasswordResetToken,
  hashPassword,
  isPasswordMatch,
  isUserExist,
} from './auth.utils';

const loginUserHandler = async (
  payload: ILoginUser
): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  const user = await isUserExist(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist!');
  }

  console.log('user information available ', user.password, password);
  const isPasswordValid = await isPasswordMatch(password, user.password);
  console.log(isPasswordValid);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password mismatch!');
  }

  const {
    userId,
    username,
    email: userEmail,
    role,
    needsPasswordChange,
  } = user;

  // Create access and refresh tokens
  const accessToken = jwtHelpers.createToken(
    { userId, username, email: userEmail, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { userId, username, email: userEmail, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsEmailVerification: !user.emailVerified,
    needsPasswordChange,
  };
};

const refreshTokenHandler = async (
  payload: string
): Promise<IRefreshTokenResponse> => {
  let verifiedToken;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      payload,
      config.jwt.refresh_secret as Secret
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }

  const { userId, username, email, role } = verifiedToken;
  const user = await isUserExist(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist!');
  }

  const newAccessToken = jwtHelpers.createToken(
    { userId, username, email, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

const forgotPasswordHandler = async (
  payload: IForgotPasswordPayload
): Promise<void> => {
  const { email } = payload;

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Generate token
  const { resetToken, hashedToken } = createPasswordResetToken();
  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { userId: user.userId },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires,
    },
  });

  // Create reset URL
  const resetURL = `${config.frontend_url}/reset-password?token=${resetToken}`;

  // Create email content
  const emailHtml = `
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <p><a href="${resetURL}">Reset Password</a></p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>This link will expire in 10 minutes.</p>
  `;

  try {
    await EmailHelper.sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html: emailHtml,
    });
  } catch (error) {
    // If email fails, reset the token fields
    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error sending password reset email'
    );
  }
};

const resetPasswordHandler = async (
  payload: IResetPasswordPayload
): Promise<void> => {
  const { token, newPassword } = payload;

  // Hash the token for comparison
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Invalid or expired password reset token'
    );
  }

  // Validate password complexity
  if (newPassword.length < 8) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Password must be at least 8 characters long'
    );
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { userId: user.userId },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordChangedAt: new Date(),
      needsPasswordChange: false,
    },
  });

  // Send confirmation email
  await EmailHelper.sendEmail({
    email: user.email,
    subject: 'Password Reset Successful',
    html: `
      <p>Your password has been successfully reset.</p>
      <p>If you didn't perform this action, please contact support immediately.</p>
    `,
  });
};

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/auth/refresh-token',
  });
};

const verifyEmail = async (token: string): Promise<void> => {
  // Hash the incoming token so you can compare with what is stored in the database
  console.log('(5) token received', token);
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  console.log('(5.1) verified hash token', hashedToken);

  // Find the user with a matching emailVerificationToken that hasn't expired
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Invalid or expired verification token'
    );
  }

  // Update the user record to mark email as verified and clear the verification token
  await prisma.user.update({
    where: { userId: user.userId },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });
};

// const verifyEmail = async (token: string): Promise<void> => {
//   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//   // Find pending signup record by token and ensure it's not expired
//   const pending = await prisma.pendingSignup.findFirst({
//     where: {
//       emailVerificationToken: hashedToken,
//       emailVerificationExpires: { gt: new Date() },
//     },
//   });

//   if (!pending) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired token');
//   }

//   // Depending on the role, create the permanent records
//   if (pending.role === 'DEVELOPER') {
//     // Extract profileData for developer
//     const { developer } = pending.profileData as any;
//     // Create Developer record
//     const newDeveloper = await prisma.developer.create({
//       data: {
//         developerId: developer.developerId, // or generate new if necessary
//         firstName: developer.firstName,
//         lastName: developer.lastName,
//         middleName: developer.middleName,
//         contact: developer.contact,
//         profileImage: developer.profileImage,
//       },
//     });

//     // Create User record linking to the Developer
//     await prisma.user.create({
//       data: {
//         userId: newDeveloper.developerId,
//         username: pending.username,
//         email: pending.email,
//         role: pending.role,
//         password: pending.password,
//         developerId: newDeveloper.developerId,
//         emailVerified: true,
//       },
//     });
//   }
//   // Handle other roles similarly (MANAGER, ADMIN, SUPER_ADMIN)

//   // Delete the pending record
//   await prisma.pendingSignup.delete({
//     where: { id: pending.id },
//   });
// };

// const verifyEmail = async (token: string): Promise<void> => {
//   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//   // Find user with a matching token that hasn't expired
//   const user = await prisma.user.findFirst({
//     where: {
//       emailVerificationToken: hashedToken,
//       emailVerificationExpires: { gt: new Date() },
//     },
//   });

//   if (!user) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired token');
//   }

//   // Mark the email as verified and clear the token
//   await prisma.user.update({
//     where: { userId: user.userId },
//     data: {
//       emailVerified: true,
//       emailVerificationToken: null,
//       emailVerificationExpires: null,
//     },
//   });
// };

const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  console.log('(3) send verification email', email);
  console.log('(3.1) send verification token', token);

  const verificationUrl = `${config.frontend_url}/verify-email?token=${token}`;
  await EmailHelper.sendEmail({
    email,
    subject: 'Verify your email',
    html: `
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
    `,
  });
};

const getCurrentUser = async (userId: string): Promise<Partial<User>> => {
  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      username: true,
      email: true,
      role: true,
      emailVerified: true,
      developerId: true,
      managerId: true,
      adminId: true,
      superAdminId: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const changePasswordHandler = async (
  user: JwtPayload | null,
  payload: IChangePassword
): Promise<void> => {
  const { oldPassword, newPassword } = payload;

  const existingUser = await isUserExist(user?.userId);
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist!');
  }

  const isOldPasswordValid = await isPasswordMatch(
    oldPassword,
    existingUser.password!
  );
  if (!isOldPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old Password is incorrect');
  }

  const isNewPasswordSame = await isPasswordMatch(
    newPassword,
    existingUser.password!
  );
  if (isNewPasswordSame) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'New password cannot be the same as the old password'
    );
  }

  // Hash the new password and update the user record
  const hashedNewPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { userId: user?.userId },
    data: {
      password: hashedNewPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  });
};

const logoutHandler = async (res: Response): Promise<void> => {
  // Clear auth cookies
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/auth/refresh-token',
  });
};

export const AuthServices = {
  loginUserHandler,
  refreshTokenHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  setAuthCookies,
  verifyEmail,
  sendVerificationEmail,
  getCurrentUser,
  changePasswordHandler,
  logoutHandler,
};
