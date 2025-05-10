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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const handleApiError_1 = __importDefault(require("../../../errors/handleApiError"));
const catchAsync_1 = require("../../../shared/catchAsync");
const sendResponse_1 = require("../../../shared/sendResponse");
const auth_services_1 = require("./auth.services");
const loginUserHandler = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const logInData = yield req.body;
        const result = yield auth_services_1.AuthServices.loginUserHandler(logInData, res);
        const { refreshToken, accessToken } = result, othersData = __rest(result, ["refreshToken", "accessToken"]);
        // DO NOT set cookies here - already set in AuthServices.loginUserHandler
        // This was causing duplicate cookies to be set
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'User signed in successfully!',
            data: othersData,
        });
    }
    catch (error) {
        next(error);
    }
}));
const refreshTokenHandler = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield auth_services_1.AuthServices.refreshTokenHandler(req, res);
        // DO NOT set cookies here - already set in AuthServices.refreshTokenHandler
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Access token refreshed successfully!',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
const forgotPasswordHandler = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield auth_services_1.AuthServices.forgotPasswordHandler(req.body);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Password reset link sent to the email successfully!',
        });
    }
    catch (error) {
        next(error);
    }
}));
const resetPasswordHandler = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield auth_services_1.AuthServices.resetPasswordHandler(req.body);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Password has been reset successfully!',
        });
    }
    catch (error) {
        next(error);
    }
}));
const verifyEmailHandler = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = yield req.body;
    if (!token) {
        throw new handleApiError_1.default(http_status_1.default.BAD_REQUEST, 'Verification token is required');
    }
    // Call the verification logic from the AuthServices.
    yield auth_services_1.AuthServices.verifyEmail(token);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Email verified and account activated successfully!',
    });
}));
const getCurrentUserHandler = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const result = yield auth_services_1.AuthServices.getCurrentUser(userId);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'User retrieved successfully!',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
const changePasswordHandler = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const passwordData = yield req.body;
        yield auth_services_1.AuthServices.changePasswordHandler(user, passwordData);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Password updated successfully!',
        });
    }
    catch (error) {
        next(error);
    }
}));
const logoutHandler = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield auth_services_1.AuthServices.logoutHandler(res);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'User signed out successfully!',
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.AuthControllers = {
    loginUserHandler,
    refreshTokenHandler,
    forgotPasswordHandler,
    resetPasswordHandler,
    verifyEmailHandler,
    getCurrentUserHandler,
    changePasswordHandler,
    logoutHandler,
};
