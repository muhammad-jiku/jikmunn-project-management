"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_controllers_1 = require("./user.controllers");
const user_validations_1 = require("./user.validations");
const router = express_1.default.Router();
router
    .route('/create-developer')
    .post((0, validateRequest_1.validateRequest)(user_validations_1.UserValidations.createDeveloper), user_controllers_1.UserControllers.insertDeveloperIntoDB);
router
    .route('/create-manager')
    .post((0, validateRequest_1.validateRequest)(user_validations_1.UserValidations.createManager), user_controllers_1.UserControllers.insertManagerIntoDB);
router
    .route('/create-admin')
    .post((0, validateRequest_1.validateRequest)(user_validations_1.UserValidations.createAdmin), user_controllers_1.UserControllers.insertAdminIntoDB);
router
    .route('/create-super-admin')
    .post((0, validateRequest_1.validateRequest)(user_validations_1.UserValidations.createSuperAdmin), user_controllers_1.UserControllers.insertSuperAdminIntoDB);
exports.UserRoutes = router;
