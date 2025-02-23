"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const user_1 = require("../../../enums/user");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const admin_controllers_1 = require("./admin.controllers");
const admin_validations_1 = require("./admin.validations");
const router = express_1.default.Router();
// Rate limiting
const adminLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
router.use(adminLimiter);
router
    .route('/')
    .get((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), admin_controllers_1.AdminControllers.getAllFromDB);
router
    .route('/:id')
    .get((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), admin_controllers_1.AdminControllers.getByIdFromDB)
    .patch((0, validateRequest_1.validateRequest)(admin_validations_1.AdminValidations.updateAdmin), (0, auth_1.auth)(user_1.USER_ROLES.ADMIN), admin_controllers_1.AdminControllers.updateOneInDB)
    .delete((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN), admin_controllers_1.AdminControllers.deleteByIdFromDB);
exports.AdminRoutes = router;
