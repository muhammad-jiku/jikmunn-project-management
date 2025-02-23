"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = require("../../middlewares/auth");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const validateRequest_1 = require("../../middlewares/validateRequest");
const auth_controllers_1 = require("./auth.controllers");
const auth_validations_1 = require("./auth.validations");
const router = express_1.default.Router();
router
    .route('/login')
    .post((0, validateRequest_1.validateRequest)(auth_validations_1.AuthValidations.loginUserHandler), rateLimiter_1.loginLimiter, auth_controllers_1.AuthControllers.loginUserHandler);
router
    .route('/refresh-token')
    .post((0, validateRequest_1.validateRequest)(auth_validations_1.AuthValidations.refreshTokenHandler), auth_controllers_1.AuthControllers.refreshTokenHandler);
router
    .route('/forgot-password')
    .post((0, validateRequest_1.validateRequest)(auth_validations_1.AuthValidations.forgotPasswordHandler), rateLimiter_1.passwordResetLimiter, auth_controllers_1.AuthControllers.forgotPasswordHandler);
router
    .route('/reset-password')
    .post((0, validateRequest_1.validateRequest)(auth_validations_1.AuthValidations.resetPasswordHandler), auth_controllers_1.AuthControllers.resetPasswordHandler);
router.route('/verify-email').post(
// Optionally, you could add validation middleware here if needed
auth_controllers_1.AuthControllers.verifyEmailHandler);
// Protected routes
router
    .route('/me')
    .get((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), auth_controllers_1.AuthControllers.getCurrentUserHandler);
router
    .route('/change-password')
    .post((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), (0, validateRequest_1.validateRequest)(auth_validations_1.AuthValidations.changePasswordHandler), auth_controllers_1.AuthControllers.changePasswordHandler);
router
    .route('/logout')
    .post((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), auth_controllers_1.AuthControllers.logoutHandler);
exports.AuthRoutes = router;
