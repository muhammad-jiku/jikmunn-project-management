"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidations = void 0;
const zod_1 = require("zod");
const loginUserHandler = zod_1.z.object({
    body: zod_1.z
        .object({
        email: zod_1.z.string({
            required_error: 'Email is required',
        }),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }),
    })
        .strict(),
});
const refreshTokenHandler = zod_1.z.object({
    cookies: zod_1.z
        .object({
        refreshToken: zod_1.z.string({
            required_error: 'Refresh Token is required',
        }),
    })
        .strict(),
});
const changePasswordHandler = zod_1.z.object({
    body: zod_1.z
        .object({
        oldPassword: zod_1.z.string({
            required_error: 'Old Password is required',
        }),
        newPassword: zod_1.z.string({
            required_error: 'New Password is required',
        }),
    })
        .strict(),
});
const forgotPasswordHandler = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({
            required_error: 'Email is required',
        })
            .email('Invalid email format'),
    }),
});
const resetPasswordHandler = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string({
            required_error: 'Token is required',
        }),
        newPassword: zod_1.z
            .string({
            required_error: 'New Password is required',
        })
            .min(8),
    }),
});
exports.AuthValidations = {
    loginUserHandler,
    refreshTokenHandler,
    changePasswordHandler,
    forgotPasswordHandler,
    resetPasswordHandler,
};
