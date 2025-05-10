import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import { ILoginUserResponse, IRefreshTokenResponse } from './auth.interfaces';
import { AuthServices } from './auth.services';

const loginUserHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logInData = await req.body;
      const result = await AuthServices.loginUserHandler(logInData, res);
      const { refreshToken, accessToken, ...othersData } = result;

      // DO NOT set cookies here - already set in AuthServices.loginUserHandler
      // This was causing duplicate cookies to be set

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
      const result = await AuthServices.refreshTokenHandler(req, res);

      // DO NOT set cookies here - already set in AuthServices.refreshTokenHandler

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
    const { token } = await req.body;

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
      const passwordData = await req.body;

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
