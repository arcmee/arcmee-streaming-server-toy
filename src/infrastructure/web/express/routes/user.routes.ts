import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  router.post('/', (req, res) => userController.createUser(req, res));
  router.post('/login', (req, res) => userController.login(req, res));
  
  router.get('/:id', (req, res) => userController.getUser(req, res));
  router.get('/:id/channel', authMiddleware, (req, res) => userController.getChannelInfo(req, res));

  return router;
};
