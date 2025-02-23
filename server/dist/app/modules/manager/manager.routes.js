"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const user_1 = require("../../../enums/user");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const manager_controllers_1 = require("./manager.controllers");
const manager_validations_1 = require("./manager.validations");
const router = express_1.default.Router();
// Rate limiting
const managerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
router.use(managerLimiter);
router
    .route('/')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER), manager_controllers_1.ManagerControllers.getAllFromDB);
router
    .route('/:id')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER), manager_controllers_1.ManagerControllers.getByIdFromDB)
    .patch((0, validateRequest_1.validateRequest)(manager_validations_1.ManagerValidations.updateManager), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER), manager_controllers_1.ManagerControllers.updateOneInDB)
    .delete((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), manager_controllers_1.ManagerControllers.deleteByIdFromDB);
exports.ManagerRoutes = router;
