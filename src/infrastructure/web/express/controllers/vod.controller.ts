import { Response } from 'express';
import { GetVodsByChannelUseCase } from '@src/application/use-cases/vod/GetVodsByChannel.usecase';
import { GetVodUseCase } from '@src/application/use-cases/vod/GetVod.usecase';
import { UploadVodUseCase } from '@src/application/use-cases/vod/UploadVod.usecase';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class VodController {
  constructor(
    private readonly getVodsByChannelUseCase: GetVodsByChannelUseCase,
    private readonly getVodUseCase: GetVodUseCase,
    private readonly uploadVodUseCase: UploadVodUseCase,
  ) {}

  async uploadVod(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const { title, description } = req.body;
      if (!title) {
        return res.status(400).json({ message: 'Title is required.' });
      }

      await this.uploadVodUseCase.execute({
        userId: req.user.userId,
        title,
        description: description || '',
        originalPath: req.file.path,
        originalMimeType: req.file.mimetype,
      });

      return res.status(202).json({ message: 'Upload successful. The video is being processed.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Make sure to clean up the uploaded file in case of an error
      if (req.file) {
        // You might want to add file cleanup logic here, e.g., fs.unlink(req.file.path, ...)
      }
      return res.status(500).json({ message: 'Failed to process upload', error: errorMessage });
    }
  }

  async getVodsByChannel(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { channelId } = req.params;
      const vods = await this.getVodsByChannelUseCase.execute({ channelId });
      return res.status(200).json(vods);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ message: 'Failed to get VODs', error: errorMessage });
    }
  }

  async getVodById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { vodId } = req.params;
      const vod = await this.getVodUseCase.execute({ vodId });
      if (!vod) {
        return res.status(404).json({ message: 'VOD not found' });
      }
      return res.status(200).json(vod);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ message: 'Failed to get VOD', error: errorMessage });
    }
  }
}
