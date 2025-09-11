import { Router } from 'express';
import { createUserRoutes } from './user.routes';
import { UserController } from '../controllers/user.controller';

export const createApiRoutes = (userController: UserController): Router => {
  const apiRouter = Router();

  apiRouter.use('/users', createUserRoutes(userController));
  // Other routes like /streams can be added here

  return apiRouter;
};
