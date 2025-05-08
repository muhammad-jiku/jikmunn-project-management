"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMemberRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const teamMember_controllers_1 = require("./teamMember.controllers");
const teamMember_validations_1 = require("./teamMember.validations");
const router = express_1.default.Router();
router
    .route('/create')
    .post((0, validateRequest_1.validateRequest)(teamMember_validations_1.TeamMemberValidations.createTeamMember), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER), teamMember_controllers_1.TeamMemberControllers.insertIntoDB);
router
    .route('/')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), teamMember_controllers_1.TeamMemberControllers.getAllFromDB);
router
    .route('/team')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), (0, validateRequest_1.validateRequest)(teamMember_validations_1.TeamMemberValidations.teamIdQuery), teamMember_controllers_1.TeamMemberControllers.getByTeamIdFromDB);
router
    .route('/user')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), (0, validateRequest_1.validateRequest)(teamMember_validations_1.TeamMemberValidations.userIdQuery), teamMember_controllers_1.TeamMemberControllers.getByUserIdFromDB);
router
    .route('/:id')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), teamMember_controllers_1.TeamMemberControllers.getByIdFromDB)
    .patch((0, auth_1.auth)(user_1.USER_ROLES.MANAGER), (0, validateRequest_1.validateRequest)(teamMember_validations_1.TeamMemberValidations.updateTeamMember), teamMember_controllers_1.TeamMemberControllers.updateOneInDB)
    .delete((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.MANAGER), teamMember_controllers_1.TeamMemberControllers.deleteByIdFromDB);
exports.TeamMemberRoutes = router;
