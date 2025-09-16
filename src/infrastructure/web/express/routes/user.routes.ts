import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  router.post('/register', (req, res) => userController.createUser(req, res));
  router.post('/login', (req, res) => userController.login(req, res));

  // Public route to get basic user info
  router.get('/:id', (req, res) => userController.getUser(req, res));

  // Protected route to get the authenticated user's own channel info
  router.get('/me/channel', authMiddleware, (req, res) => userController.getMyChannelInfo(req, res));

  // Public route to get channel info for any user
  router.get('/:id/channel', (req, res) => userController.getChannelInfo(req, res));

  return router;
};