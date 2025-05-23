import express from 'express';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { DeveloperRoutes } from '../modules/developer/developer.routes';
import { ManagerRoutes } from '../modules/manager/manager.routes';
import { ProjectRoutes } from '../modules/project/project.routes';
import { ProjectTeamRoutes } from '../modules/projectTeam/projectTeam.routes';
import { SuperAdminRoutes } from '../modules/superAdmin/superAdmin.routes';
import { TaskRoutes } from '../modules/task/task.routes';
import { TeamRoutes } from '../modules/team/team.routes';
import { TeamMemberRoutes } from '../modules/teamMember/teamMember.routes';
import { UserRoutes } from '../modules/user/user.routes';

const routes = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/developers',
    route: DeveloperRoutes,
  },
  {
    path: '/managers',
    route: ManagerRoutes,
  },
  {
    path: '/admins',
    route: AdminRoutes,
  },
  {
    path: '/super-admins',
    route: SuperAdminRoutes,
  },
  {
    path: '/projects',
    route: ProjectRoutes,
  },
  {
    path: '/tasks',
    route: TaskRoutes,
  },
  {
    path: '/teams',
    route: TeamRoutes,
  },
  {
    path: '/team-members',
    route: TeamMemberRoutes,
  },
  {
    path: '/project-teams',
    route: ProjectTeamRoutes,
  },
];

moduleRoutes.forEach((r) => routes.use(r.path, r.route));
export default routes;
