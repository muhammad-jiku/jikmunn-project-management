import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import ApiError from '../../../errors/handleApiError';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import { ILoginUserResponse, IRefreshTokenResponse } from './auth.interfaces';
import { AuthServices } from './auth.services';

const loginUserHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logInData = req.body;
      const result = await AuthServices.loginUserHandler(logInData, res);
      const { refreshToken, ...othersData } = result;

      // Set refresh token into cookie
      const cookieOptions = {
        secure: config.env === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie('refreshToken', refreshToken, cookieOptions);

      sendResponse<ILoginUserResponse>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User signed in successfully!',
        data: othersData,
      });
    } catch (error) {
      next(error);
    }
  }
);

const refreshTokenHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const result = await AuthServices.refreshTokenHandler(refreshToken);

      // Set refresh token into cookie
      const cookieOptions = {
        secure: config.env === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie('refreshToken', refreshToken, cookieOptions);

      sendResponse<IRefreshTokenResponse>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Access token refreshed successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

const forgotPasswordHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AuthServices.forgotPasswordHandler(req.body);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password reset link sent to the email successfully!',
      });
    } catch (error) {
      next(error);
    }
  }
);

const resetPasswordHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AuthServices.resetPasswordHandler(req.body);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password has been reset successfully!',
      });
    } catch (error) {
      next(error);
    }
  }
);

const verifyEmailHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
    console.log('(4) verified email handler', token);

    if (!token) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Verification token is required'
      );
    }
    // Call the verification logic from the AuthServices.
    await AuthServices.verifyEmail(token);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Email verified and account activated successfully!',
    });
  }
);

const getCurrentUserHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const result = await AuthServices.getCurrentUser(userId);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User retrieved successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

const changePasswordHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const passwordData = req.body;

      await AuthServices.changePasswordHandler(user, passwordData);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password updated successfully!',
      });
    } catch (error) {
      next(error);
    }
  }
);

const logoutHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AuthServices.logoutHandler(res);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User signed out successfully!',
      });
    } catch (error) {
      next(error);
    }
  }
);

export const AuthControllers = {
  loginUserHandler,
  refreshTokenHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  verifyEmailHandler,
  getCurrentUserHandler,
  changePasswordHandler,
  logoutHandler,
};
