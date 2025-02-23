"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const team_controllers_1 = require("./team.controllers");
const team_validations_1 = require("./team.validations");
const router = express_1.default.Router();
router
    .route('/create')
    .post((0, validateRequest_1.validateRequest)(team_validations_1.TeamValidations.createTeam), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER), team_controllers_1.TeamControllers.insertIntoDB);
router
    .route('/')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), team_controllers_1.TeamControllers.getAllFromDB);
router
    .route('/:id')
    .get((0, auth_1.auth)(user_1.USER_ROLES.MANAGER, user_1.USER_ROLES.DEVELOPER), team_controllers_1.TeamControllers.getByIdFromDB)
    .patch((0, validateRequest_1.validateRequest)(team_validations_1.TeamValidations.updateTeam), (0, auth_1.auth)(user_1.USER_ROLES.MANAGER), team_controllers_1.TeamControllers.updateOneInDB)
    .delete((0, auth_1.auth)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.MANAGER), team_controllers_1.TeamControllers.deleteByIdFromDB);
exports.TeamRoutes = router;
