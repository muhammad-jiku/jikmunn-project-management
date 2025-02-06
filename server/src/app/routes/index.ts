import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ProjectRoutes } from '../modules/project/project.routes';
import { TaskRoutes } from '../modules/task/task.routes';
import { TeamRoutes } from '../modules/team/team.routes';
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
];

moduleRoutes.forEach((r) => routes.use(r.path, r.route));
export default routes;
