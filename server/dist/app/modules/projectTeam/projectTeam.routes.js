"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTeamRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const projectTeam_controllers_1 = require("./projectTeam.controllers");
const projectTeam_validations_1 = require("./projectTeam.validations");
const router = express_1.default.Router();
router
    .route('/create')
    .post((0, validateRequest_1.validateRequest)(projectTeam_validations_1.ProjectTeamValidations.createProjectTeam), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER), projectTeam_controllers_1.ProjectTeamControllers.insertIntoDB);
router
    .route('/')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), projectTeam_controllers_1.ProjectTeamControllers.getAllFromDB);
router
    .route('/project')
    .get((0, validateRequest_1.validateRequest)(projectTeam_validations_1.ProjectTeamValidations.projectIdQuery), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), projectTeam_controllers_1.ProjectTeamControllers.getByProjectIdFromDB);
router
    .route('/team')
    .get((0, validateRequest_1.validateRequest)(projectTeam_validations_1.ProjectTeamValidations.teamIdQuery), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), projectTeam_controllers_1.ProjectTeamControllers.getByTeamIdFromDB);
router
    .route('/:id')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), projectTeam_controllers_1.ProjectTeamControllers.getByIdFromDB)
    .patch((0, validateRequest_1.validateRequest)(projectTeam_validations_1.ProjectTeamValidations.updateProjectTeam), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER), projectTeam_controllers_1.ProjectTeamControllers.updateOneInDB)
    .delete((0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), projectTeam_controllers_1.ProjectTeamControllers.deleteByIdFromDB);
exports.ProjectTeamRoutes = router;
