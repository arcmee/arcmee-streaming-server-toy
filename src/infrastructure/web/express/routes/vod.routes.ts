import { Router } from 'express';
import { VodController } from '../controllers/vod.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';

export const createVodRoutes = (vodController: VodController): Router => {
  const router = Router();

  router.post('/upload', authMiddleware, uploadMiddleware.single('video'), (req, res) =>
    vodController.uploadVod(req, res),
  );

  router.get('/channel/:channelId', (req, res) => vodController.getVodsByChannel(req, res));
  router.get('/:vodId', (req, res) => vodController.getVodById(req, res));

  return router;
};
