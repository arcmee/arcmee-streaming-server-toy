import { Router } from 'express';
import { StreamController } from '../controllers/stream.controller';

export const createStreamRoutes = (streamController: StreamController): Router => {
  const router = Router();

  // Route for Node-Media-Server webhooks
  router.post('/webhooks', (req, res) => streamController.handleNmsWebhook(req, res));

  // Public route to get all live streams
  router.get('/', (req, res) => streamController.getLiveStreams(req, res));

  return router;
};
