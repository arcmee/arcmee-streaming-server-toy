import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  router.get('/:id', (req, res) => userController.getUser(req, res));

  return router;
};
