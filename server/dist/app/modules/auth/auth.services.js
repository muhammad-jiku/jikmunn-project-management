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
const prisma_1 = require("../../../shared/prisma");
const auth_utils_1 = require("./auth.utils");
const loginUserHandler = (payload, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const user = yield (0, auth_utils_1.isUserExist)(email);
    if (!user) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist!');
    }
    console.log('user information available ', user.password, password);
    const isPasswordValid = yield (0, auth_utils_1.isPasswordMatch)(password, user.password);
    console.log(isPasswordValid);
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
        yield prisma_1.prisma.user.update({
            where: { userId: user.userId },
            data: {
                emailVerificationToken: hashedToken,
                emailVerificationExpires: verificationExpires,
            },
        });
        console.log('Sending verification email to:', userEmail);
        console.log('Plain verification token:', verificationToken);
        yield sendVerificationEmail(userEmail, verificationToken);
    }
    return {
        accessToken,
        refreshToken,
        needsEmailVerification: !user.emailVerified,
        needsPasswordChange,
    };
});
const refreshTokenHandler = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let verifiedToken;
    try {
        verifiedToken = jwt_1.jwtHelpers.verifyToken(payload, config_1.default.jwt.refresh_secret);
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
    return {
        accessToken: newAccessToken,
    };
});
const forgotPasswordHandler = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = payload;
    const user = yield prisma_1.prisma.user.findFirst({
        where: { email },
    });
    if (!user) {
        throw new handleApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Generate token
    const { resetToken, hashedToken } = (0, auth_utils_1.createPasswordResetToken)();
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    yield prisma_1.prisma.user.update({
        where: { userId: user.userId },
        data: {
            passwordResetToken: hashedToken,
            passwordResetExpires,
        },
    });
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
        yield prisma_1.prisma.user.update({
            where: { userId: user.userId },
            data: {
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
        throw new handleApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error sending password reset email');
    }
});
const resetPasswordHandler = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = payload;
    // Hash the token for comparison
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const user = yield prisma_1.prisma.user.findFirst({
        where: {
            passwordResetToken: hashedToken,
            passwordResetExpires: {
                gt: new Date(),
            },
        },
    });
    if (!user) {
        throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid or expired password reset token');
    }
    // Validate password complexity
    if (newPassword.length < 8) {
        throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Password must be at least 8 characters long');
    }
    const hashedPassword = yield (0, auth_utils_1.hashPassword)(newPassword);
    yield prisma_1.prisma.user.update({
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
});
const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('is production', isProduction);
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction, // secure only in production (HTTPS)
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/auth/refresh-token',
    });
};
const verifyEmail = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // Hash the incoming token so you can compare with what is stored in the database
    console.log('(5) token received', token);
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    console.log('(5.1) verified hash token', hashedToken);
    // Find the user with a matching emailVerificationToken that hasn't expired
    const user = yield prisma_1.prisma.user.findFirst({
        where: {
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { gt: new Date() },
        },
    });
    if (!user) {
        throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid or expired verification token');
    }
    // Update the user record to mark email as verified and clear the verification token
    yield prisma_1.prisma.user.update({
        where: { userId: user.userId },
        data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
        },
    });
});
const sendVerificationEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('(3) send verification email', email);
    console.log('(3.1) send verification token', token);
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
    const user = yield prisma_1.prisma.user.findUnique({
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
    });
    return user;
});
const changePasswordHandler = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword } = payload;
    const existingUser = yield (0, auth_utils_1.isUserExist)(user === null || user === void 0 ? void 0 : user.email);
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
    yield prisma_1.prisma.user.update({
        where: { userId: user === null || user === void 0 ? void 0 : user.userId },
        data: {
            password: hashedNewPassword,
            needsPasswordChange: false,
            passwordChangedAt: new Date(),
        },
    });
});
const logoutHandler = (res) => __awaiter(void 0, void 0, void 0, function* () {
    // Clear cookies using res.clearCookie for convenience
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        // expires: new Date(0), // Force expiration
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth/refresh-token',
        // expires: new Date(0), // Force expiration
    });
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
