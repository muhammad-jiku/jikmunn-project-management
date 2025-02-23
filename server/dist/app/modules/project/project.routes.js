"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const project_controllers_1 = require("./project.controllers");
const project_validations_1 = require("./project.validations");
const router = express_1.default.Router();
router
    .route('/create')
    .post((0, validateRequest_1.validateRequest)(project_validations_1.ProjectValidations.createProject), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER), project_controllers_1.ProjectControllers.insertIntoDB);
router
    .route('/')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), project_controllers_1.ProjectControllers.getAllFromDB);
router
    .route('/:id')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), project_controllers_1.ProjectControllers.getByIdFromDB)
    .patch((0, validateRequest_1.validateRequest)(project_validations_1.ProjectValidations.updateProject), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER), project_controllers_1.ProjectControllers.updateIntoDB)
    .delete((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.MANAGER), project_controllers_1.ProjectControllers.deleteFromDB);
router
    .route('/teams/update')
    .post((0, validateRequest_1.validateRequest)(project_validations_1.ProjectValidations.updateProjectTeams), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER), project_controllers_1.ProjectControllers.updateProjectTeamsById);
exports.ProjectRoutes = router;
