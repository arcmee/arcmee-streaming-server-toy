import { Router } from 'express';
import { VodController } from '../controllers/vod.controller';

export const createVodRoutes = (vodController: VodController): Router => {
  const router = Router();

  router.get('/channel/:channelId', (req, res) => vodController.getVodsByChannel(req, res));
  router.get('/:vodId', (req, res) => vodController.getVodById(req, res));

  return router;
};
