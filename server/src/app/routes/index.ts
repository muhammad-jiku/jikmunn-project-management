import express from 'express';
import { ProjectRoutes } from '../modules/project/project.routes';
import { TaskRoutes } from '../modules/task/task.routes';

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
];

moduleRoutes.forEach((r) => routes.use(r.path, r.route));
export default routes;
