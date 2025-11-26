import { Router } from 'express';
import path from 'path';

const MEDIA_ROOT = path.join(__dirname, '../../../../media/live');

export const createStreamPlayRoutes = (): Router => {
  const router = Router();

  // Serve HLS playlists/segments (fallback if CDN not used)
  router.use('/live', (req, res, next) => {
    const filePath = path.join(MEDIA_ROOT, req.path);
    res.sendFile(filePath, err => {
      if (err) {
        next();
      }
    });
  });

  return router;
};
