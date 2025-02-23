"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_routes_1 = require("../modules/admin/admin.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const developer_routes_1 = require("../modules/developer/developer.routes");
const manager_routes_1 = require("../modules/manager/manager.routes");
const project_routes_1 = require("../modules/project/project.routes");
const superAdmin_routes_1 = require("../modules/superAdmin/superAdmin.routes");
const task_routes_1 = require("../modules/task/task.routes");
const team_routes_1 = require("../modules/team/team.routes");
const user_routes_1 = require("../modules/user/user.routes");
const routes = express_1.default.Router();
const moduleRoutes = [
    // ... routes
    {
        path: '/users',
        route: user_routes_1.UserRoutes,
    },
    {
        path: '/auth',
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: '/developers',
        route: developer_routes_1.DeveloperRoutes,
    },
    {
        path: '/managers',
        route: manager_routes_1.ManagerRoutes,
    },
    {
        path: '/admins',
        route: admin_routes_1.AdminRoutes,
    },
    {
        path: '/super-admins',
        route: superAdmin_routes_1.SuperAdminRoutes,
    },
    {
        path: '/projects',
        route: project_routes_1.ProjectRoutes,
    },
    {
        path: '/tasks',
        route: task_routes_1.TaskRoutes,
    },
    {
        path: '/teams',
        route: team_routes_1.TeamRoutes,
    },
];
moduleRoutes.forEach((r) => routes.use(r.path, r.route));
exports.default = routes;
