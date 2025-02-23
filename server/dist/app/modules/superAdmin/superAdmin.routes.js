"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const user_1 = require("../../../enums/user");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const superAdmin_controllers_1 = require("./superAdmin.controllers");
const superAdmin_validations_1 = require("./superAdmin.validations");
const router = express_1.default.Router();
// Rate limiting
const superAdminLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
router.use(superAdminLimiter);
router
    .route('/')
    .get((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN), superAdmin_controllers_1.SuperAdminControllers.getAllFromDB);
router
    .route('/:id')
    .get((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN), superAdmin_controllers_1.SuperAdminControllers.getByIdFromDB)
    .patch((0, validateRequest_1.validateRequest)(superAdmin_validations_1.SuperAdminValidations.updateSuperAdmin), (0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN), superAdmin_controllers_1.SuperAdminControllers.updateOneInDB)
    .delete((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN), superAdmin_controllers_1.SuperAdminControllers.deleteByIdFromDB);
exports.SuperAdminRoutes = router;
