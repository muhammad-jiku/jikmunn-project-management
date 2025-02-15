import { z } from 'zod';

const loginUserHandler = z.object({
  body: z
    .object({
      email: z.string({
        required_error: 'Email is required',
      }),
      password: z.string({
        required_error: 'Password is required',
      }),
    })
    .strict(),
});

const refreshTokenHandler = z.object({
  cookies: z
    .object({
      refreshToken: z.string({
        required_error: 'Refresh Token is required',
      }),
    })
    .strict(),
});

const changePasswordHandler = z.object({
  body: z
    .object({
      oldPassword: z.string({
        required_error: 'Old Password is required',
      }),
      newPassword: z.string({
        required_error: 'New Password is required',
      }),
    })
    .strict(),
});

const forgotPasswordHandler = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
  }),
});

const resetPasswordHandler = z.object({
  body: z.object({
    token: z.string({
      required_error: 'Token is required',
    }),
    newPassword: z
      .string({
        required_error: 'New Password is required',
      })
      .min(8),
  }),
});

export const AuthValidations = {
  loginUserHandler,
  refreshTokenHandler,
  changePasswordHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
};
