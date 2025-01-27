import express from 'express';
import { ProjectRoutes } from '../modules/project/project.routes';
import { TaskRoutes } from '../modules/task/task.routes';
import { TeamRoutes } from '../modules/team/team.routes';
import { UserRoutes } from '../modules/user/user.routes';

const routes = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/projects',
    route: ProjectRoutes,
  },
  {
    path: '/tasks',
    route: TaskRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/teams',
    route: TeamRoutes,
  },
];

moduleRoutes.forEach((r) => routes.use(r.path, r.route));
export default routes;
