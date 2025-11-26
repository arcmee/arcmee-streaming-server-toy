import express, { Router } from 'express';
import { StreamController } from '../controllers/stream.controller';

export const createStreamRoutes = (streamController: StreamController): Router => {
  const router = Router();

  // Route for Node-Media-Server webhooks
  router.post(
    '/webhooks',
    express.text({ type: '*/*' }),
    (req, res, next) => {
      // If body is a JSON string (from NMS fetch without headers), attempt to parse
      if (typeof req.body === 'string') {
        try {
          req.body = JSON.parse(req.body);
        } catch {
          // leave as-is; handler will validate
        }
      }
      next();
    },
    (req, res) => streamController.handleNmsWebhook(req, res),
  );

  // Public route to get all live streams
  router.get('/', (req, res) => streamController.getLiveStreams(req, res));

  return router;
};
