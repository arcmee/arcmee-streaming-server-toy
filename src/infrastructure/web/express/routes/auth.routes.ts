import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/refresh', (req, res) => authController.refresh(req, res));
  router.post('/logout', (req, res) => authController.logout(req, res));

  return router;
};
