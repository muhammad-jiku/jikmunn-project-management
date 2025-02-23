"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const task_controllers_1 = require("./task.controllers");
const task_validations_1 = require("./task.validations");
const router = express_1.default.Router();
router.post('/create', (0, validateRequest_1.validateRequest)(task_validations_1.TaskValidations.createTask), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), task_controllers_1.TaskControllers.insertIntoDB);
router.get('/', (0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), task_controllers_1.TaskControllers.getAllFromDB);
router
    .route('/:id')
    .patch((0, validateRequest_1.validateRequest)(task_validations_1.TaskValidations.updateTask), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), task_controllers_1.TaskControllers.updateTaskStatusInDB)
    .delete((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), task_controllers_1.TaskControllers.deleteByIdFromDB);
router.get('/user/:userId', (0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), task_controllers_1.TaskControllers.getUserTasksFromDB);
exports.TaskRoutes = router;
