"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const crypto_1 = __importDefault(require("crypto"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const handleApiError_1 = __importDefault(require("../../../errors/handleApiError"));
const emailSender_1 = require("../../../helpers/emailSender");
const jwt_1 = require("../../../helpers/jwt");
const prisma_1 = require("../../../lib/prisma");
const transactionManager_1 = require("../../../lib/transactionManager");
const auth_utils_1 = require("./auth.utils");
const loginUserHandler = (payload, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const user = yield (0, auth_utils_1.isUserExist)(email);
    if (!user) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist!');
    }
    const isPasswordValid = yield (0, auth_utils_1.isPasswordMatch)(password, user.password);
    if (!isPasswordValid) {
        throw new handleApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Password mismatch!');
    }
    const { userId, username, email: userEmail, role, needsPasswordChange, } = user;
    // Create access and refresh tokens
    const accessToken = jwt_1.jwtHelpers.createToken({ userId, username, email: userEmail, role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwt_1.jwtHelpers.createToken({ userId, username, email: userEmail, role }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    // Set cookies for tokens
    setAuthCookies(res, accessToken, refreshToken);
    // If the user is unverified, generate a new verification token and send email.
    if (!user.emailVerified) {
        const { verificationToken, hashedToken } = (0, auth_utils_1.createEmailVerificationToken)();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.user.update({
            where: { userId: user.userId },
            data: {
                emailVerificationToken: hashedToken,
                emailVerificationExpires: verificationExpires,
            },
        }));
        yield sendVerificationEmail(userEmail, verificationToken);
    }
    return {
        accessToken,
        refreshToken,
        needsEmailVerification: !user.emailVerified,
        needsPasswordChange,
    };
});
const refreshTokenHandler = (req, // Use the correct type directly
res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // No need for casting
    const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    if (!refreshToken) {
        throw new handleApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Refresh token not found');
    }
    let verifiedToken;
    try {
        verifiedToken = jwt_1.jwtHelpers.verifyToken(refreshToken, config_1.default.jwt.refresh_secret);
    }
    catch (err) {
        throw new handleApiError_1.default(http_status_1.default.FORBIDDEN, 'Invalid Refresh Token');
    }
    const { userId, username, email, role } = verifiedToken;
    const user = yield (0, auth_utils_1.isUserExist)(email);
    if (!user) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist!');
    }
    const newAccessToken = jwt_1.jwtHelpers.createToken({ userId, username, email, role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    // Update the access token cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    res.cookie('accessToken', newAccessToken, cookieOptions);
    // Don't set refresh token again - just reuse the existing one
    return {
        accessToken: newAccessToken,
    };
});
const forgotPasswordHandler = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = payload;
    const user = yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.user.findFirst({
        where: { email },
    }));
    if (!user) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Generate token
    const { resetToken, hashedToken } = (0, auth_utils_1.createPasswordResetToken)();
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.user.update({
        where: { userId: user.userId },
        data: {
            passwordResetToken: hashedToken,
            passwordResetExpires,
        },
    }));
    // Create reset URL
    const resetURL = `${config_1.default.frontend_url}/reset-password?token=${resetToken}`;
    // Create email content
    const emailHtml = `
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <p><a href="${resetURL}">Reset Password</a></p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>This link will expire in 10 minutes.</p>
  `;
    try {
        yield emailSender_1.EmailHelper.sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            html: emailHtml,
        });
    }
    catch (error) {
        // If email fails, reset the token fields
        yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.user.update({
            where: { userId: user.userId },
            data: {
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        }));
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error sending password reset email');
    }
});
const resetPasswordHandler = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const { token, newPassword } = payload;
        // Hash the token for comparison
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = yield tx.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid or expired password reset token!');
        }
        // Validate password complexity
        if (newPassword.length < 8) {
            throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Password must be at least 8 characters long');
        }
        const hashedPassword = yield (0, auth_utils_1.hashPassword)(newPassword);
        yield tx.user.update({
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
        yield emailSender_1.EmailHelper.sendEmail({
            email: user.email,
            subject: 'Password Reset Successful',
            html: `
        <p>Your password has been successfully reset.</p>
        <p>If you didn't perform this action, please contact support immediately.</p>
      `,
        });
    }));
});
const setAuthCookies = (res, accessToken, refreshToken) => {
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
    if (isProduction && config_1.default.frontend_url) {
        try {
            const frontendURL = new URL(config_1.default.frontend_url);
            const hostname = frontendURL.hostname;
            console.log('Frontend URL:', config_1.default.frontend_url);
            console.log('Hostname:', hostname);
            // Don't set domain for localhost
            if (hostname !== 'localhost') {
                // For production, use the actual domain
                cookieDomain = hostname;
            }
            console.log('Cookie Domain:', cookieDomain);
        }
        catch (error) {
            console.error('Error parsing frontend URL:', error);
            cookieDomain = undefined;
        }
    }
    console.log('Cookie Domain:', cookieDomain);
    // Common cookie options
    const cookieOptions = {
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
const verifyEmail = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Hash the incoming token so you can compare with what is stored in the database
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        // Find the user with a matching emailVerificationToken that hasn't expired
        const user = yield tx.user.findFirst({
            where: {
                emailVerificationToken: hashedToken,
                emailVerificationExpires: { gt: new Date() },
            },
        });
        if (!user) {
            throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid or expired verification token');
        }
        // Update the user record to mark email as verified and clear the verification token
        yield tx.user.update({
            where: { userId: user.userId },
            data: {
                emailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpires: null,
            },
        });
    }));
});
const sendVerificationEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationUrl = `${config_1.default.frontend_url}/verify-email?token=${token}`;
    yield emailSender_1.EmailHelper.sendEmail({
        email,
        subject: 'Verify your email',
        html: `
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
    `,
    });
});
const getCurrentUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeQuery)(() => prisma_1.prisma.user.findUnique({
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
    }));
});
const changePasswordHandler = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, transactionManager_1.executeSafeTransaction)((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const { oldPassword, newPassword } = payload;
        if (!(user === null || user === void 0 ? void 0 : user.email)) {
            throw new handleApiError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
        }
        const existingUser = yield (0, auth_utils_1.isUserExist)(user.email);
        if (!existingUser) {
            throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist!');
        }
        const isOldPasswordValid = yield (0, auth_utils_1.isPasswordMatch)(oldPassword, existingUser.password);
        if (!isOldPasswordValid) {
            throw new handleApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Old Password is incorrect');
        }
        const isNewPasswordSame = yield (0, auth_utils_1.isPasswordMatch)(newPassword, existingUser.password);
        if (isNewPasswordSame) {
            throw new handleApiError_1.default(http_status_1.default.CONFLICT, 'New password cannot be the same as the old password');
        }
        // Hash the new password and update the user record
        const hashedNewPassword = yield (0, auth_utils_1.hashPassword)(newPassword);
        yield tx.user.update({
            where: { userId: user.userId },
            data: {
                password: hashedNewPassword,
                needsPasswordChange: false,
                passwordChangedAt: new Date(),
            },
        });
    }));
});
const logoutHandler = (res) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (isProduction && config_1.default.frontend_url) {
        try {
            const frontendURL = new URL(config_1.default.frontend_url);
            const hostname = frontendURL.hostname;
            console.log('Frontend URL:', config_1.default.frontend_url);
            console.log('Hostname:', hostname);
            // Don't set domain for localhost
            if (hostname !== 'localhost') {
                // For production, use the actual domain
                cookieDomain = hostname;
            }
            console.log('Cookie Domain:', cookieDomain);
        }
        catch (error) {
            console.error('Error parsing frontend URL:', error);
            cookieDomain = undefined;
        }
    }
    // Common cookie options
    const cookieOptions = {
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
});
exports.AuthServices = {
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
