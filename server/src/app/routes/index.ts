import express from 'express';
import { ProjectRoutes } from '../modules/project/project.routes';

const routes = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/projects',
    route: ProjectRoutes,
  },
];

moduleRoutes.forEach((r) => routes.use(r.path, r.route));
export default routes;
