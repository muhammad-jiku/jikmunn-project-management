import { User } from '@prisma/client';
import crypto from 'crypto';
import { CookieOptions, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/handleApiError';
import { EmailHelper } from '../../../helpers/emailSender';
import { jwtHelpers } from '../../../helpers/jwt';
import { prisma } from '../../../lib/prisma';
import {
  executeSafeQuery,
  executeSafeTransaction,
} from '../../../lib/transactionManager';
import {
  IChangePassword,
  IForgotPasswordPayload,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
  IResetPasswordPayload,
} from './auth.interfaces';
import {
  createEmailVerificationToken,
  createPasswordResetToken,
  hashPassword,
  isPasswordMatch,
  isUserExist,
} from './auth.utils';

const loginUserHandler = async (
  payload: ILoginUser,
  res: Response
): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  const user = await isUserExist(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist!');
  }

  const isPasswordValid = await isPasswordMatch(password, user.password);

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

  // Set cookies for tokens
  setAuthCookies(res, accessToken, refreshToken);

  // If the user is unverified, generate a new verification token and send email.
  if (!user.emailVerified) {
    const { verificationToken, hashedToken } = createEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await executeSafeQuery(() =>
      prisma.user.update({
        where: { userId: user.userId },
        data: {
          emailVerificationToken: hashedToken,
          emailVerificationExpires: verificationExpires,
        },
      })
    );

    await sendVerificationEmail(userEmail, verificationToken);
  }

  return {
    accessToken,
    refreshToken,
    needsEmailVerification: !user.emailVerified,
    needsPasswordChange,
  };
};

const refreshTokenHandler = async (
  req: RequestWithCookies, // Use the correct type directly
  res: Response
): Promise<IRefreshTokenResponse> => {
  // No need for casting
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Refresh token not found');
  }

  let verifiedToken;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      refreshToken,
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

  // Update the access token cookie
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : ('lax' as 'none' | 'lax'),
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('accessToken', newAccessToken, cookieOptions);
  // Don't set refresh token again - just reuse the existing one

  return {
    accessToken: newAccessToken,
  };
};

const forgotPasswordHandler = async (
  payload: IForgotPasswordPayload
): Promise<void> => {
  const { email } = payload;

  const user = await executeSafeQuery(() =>
    prisma.user.findFirst({
      where: { email },
    })
  );

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Generate token
  const { resetToken, hashedToken } = createPasswordResetToken();
  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await executeSafeQuery(() =>
    prisma.user.update({
      where: { userId: user.userId },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires,
      },
    })
  );

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
    await executeSafeQuery(() =>
      prisma.user.update({
        where: { userId: user.userId },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      })
    );

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error sending password reset email'
    );
  }
};

const resetPasswordHandler = async (
  payload: IResetPasswordPayload
): Promise<void> => {
  return await executeSafeTransaction(async (tx) => {
    const { token, newPassword } = payload;

    // Hash the token for comparison
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await tx.user.findFirst({
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
        'Invalid or expired password reset token!'
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

    await tx.user.update({
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
  });
};

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Simpler, more reliable domain extraction
  // let cookieDomain;
  // if (isProduction && config.frontend_url) {
  //   try {
  //     const frontendDomain = new URL(config.frontend_url).hostname;
  //     // Don't use a dot prefix for domains - modern browsers handle this automatically
  //     cookieDomain =
  //       frontendDomain === 'localhost' ? undefined : frontendDomain;
  //   } catch (error) {
  //     console.error('Error parsing frontend URL:', error);
  //     cookieDomain = undefined;
  //   }
  // }
  // Improved domain extraction
  let cookieDomain;
  if (isProduction && config.frontend_url) {
    try {
      const frontendURL = new URL(config.frontend_url);
      const hostname = frontendURL.hostname;

      console.log('Frontend URL:', config.frontend_url);
      console.log('Hostname:', hostname);

      // Don't set domain for localhost
      if (hostname !== 'localhost') {
        // For production, use the actual domain
        cookieDomain = hostname;
      }

      console.log('Cookie Domain:', cookieDomain);
    } catch (error) {
      console.error('Error parsing frontend URL:', error);
      cookieDomain = undefined;
    }
  }

  console.log('Cookie Domain:', cookieDomain);

  // Common cookie options
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction, // true in production for HTTPS
    // sameSite: isProduction ? 'none' : ('lax' as 'none' | 'lax'), // 'none' allows cross-site cookies in production
    sameSite: isProduction ? 'none' : 'lax', // Explicitly typed as SameSiteOptions
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // domain: cookieDomain,
  };

  // Only add domain in production and when it's a valid domain
  if (isProduction && cookieDomain && cookieDomain !== 'localhost') {
    cookieOptions.domain = cookieDomain;
  }

  // Set access token cookie
  res.cookie('accessToken', accessToken, cookieOptions);

  // Set refresh token cookie - only set once with consistent path
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // // Set refresh token cookie - only set once with the path of '/auth/refresh-token'
  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: true,
  //   secure: isProduction,
  //   sameSite: 'lax',
  //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  //   path: '/auth/refresh-token',
  // });

  // For debugging
  console.log('Cookies set:', {
    accessToken: !!accessToken,
    refreshToken: !!refreshToken,
    options: cookieOptions,
  });
};

const verifyEmail = async (token: string): Promise<void> => {
  return await executeSafeTransaction(async (tx) => {
    // Hash the incoming token so you can compare with what is stored in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user with a matching emailVerificationToken that hasn't expired
    const user = await tx.user.findFirst({
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
    await tx.user.update({
      where: { userId: user.userId },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });
  });
};

const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
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

const getCurrentUser = async (
  userId: string
): Promise<Partial<User> | null> => {
  return await executeSafeQuery(() =>
    prisma.user.findUnique({
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
        developer: {
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
            profileImage: true,
            contact: true,
          },
        },
        manager: {
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
            profileImage: true,
            contact: true,
          },
        },
        admin: {
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
            profileImage: true,
            contact: true,
          },
        },
        superAdmin: {
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
            profileImage: true,
            contact: true,
          },
        },
        authoredTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
        ownedTeams: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTeams: {
          select: {
            id: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        Project: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    })
  );
};

const changePasswordHandler = async (
  user: JwtPayload | null,
  payload: IChangePassword
): Promise<void> => {
  return await executeSafeTransaction(async (tx) => {
    const { oldPassword, newPassword } = payload;

    if (!user?.email) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    const existingUser = await isUserExist(user.email);
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
    await tx.user.update({
      where: { userId: user.userId },
      data: {
        password: hashedNewPassword,
        needsPasswordChange: false,
        passwordChangedAt: new Date(),
      },
    });
  });
};

const logoutHandler = async (res: Response): Promise<void> => {
  const isProduction = process.env.NODE_ENV === 'production';

  // // Simpler, more reliable domain extraction
  // let cookieDomain;
  // if (isProduction && config.frontend_url) {
  //   try {
  //     const frontendDomain = new URL(config.frontend_url).hostname;
  //     // Don't use a dot prefix for domains - modern browsers handle this automatically
  //     cookieDomain =
  //       frontendDomain === 'localhost' ? undefined : frontendDomain;
  //   } catch (error) {
  //     console.error('Error parsing frontend URL:', error);
  //     cookieDomain = undefined;
  //   }
  // }
  // Improved domain extraction - same as setAuthCookies
  let cookieDomain;
  if (isProduction && config.frontend_url) {
    try {
      const frontendURL = new URL(config.frontend_url);
      const hostname = frontendURL.hostname;

      console.log('Frontend URL:', config.frontend_url);
      console.log('Hostname:', hostname);

      // Don't set domain for localhost
      if (hostname !== 'localhost') {
        // For production, use the actual domain
        cookieDomain = hostname;
      }

      console.log('Cookie Domain:', cookieDomain);
    } catch (error) {
      console.error('Error parsing frontend URL:', error);
      cookieDomain = undefined;
    }
  }

  // Common cookie options
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction, // true in production for HTTPS
    // sameSite: isProduction ? 'none' : ('lax' as 'none' | 'lax'), // 'none' allows cross-site cookies in production
    sameSite: isProduction ? 'none' : 'lax', // Explicitly typed as SameSiteOptions
    path: '/',
    // domain: cookieDomain,
  };

  // Only add domain in production and when it's a valid domain
  if (isProduction && cookieDomain && cookieDomain !== 'localhost') {
    cookieOptions.domain = cookieDomain;
  }

  // Clear cookies properly
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  // // Optionally, you can also clear the cookie to expire immediately in '/auth/refresh-token' path
  // res.clearCookie('refreshToken', {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'lax',
  //   path: '/auth/refresh-token',
  //   // expires: new Date(0), // Force expiration
  // });

  res.status(200).json({ message: 'Signed out successfully!' });
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
