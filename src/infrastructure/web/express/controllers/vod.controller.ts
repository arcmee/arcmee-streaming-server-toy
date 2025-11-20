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

    return res
      .status(202)
      .json({ message: 'Upload successful. The video is being processed.' });
  }

  async getVodsByChannel(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { channelId } = req.params;
    const result = await this.getVodsByChannelUseCase.execute({ channelId });
    if (result.ok) {
      return res.status(200).json(result.value);
    }
    return res.status(500).json({ message: 'Failed to fetch VODs.' });
  }

  async getVodById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { vodId } = req.params;
    const result = await this.getVodUseCase.execute({ vodId });

    if (result.ok) {
      return res.status(200).json(result.value);
    } else {
      return res.status(404).json({ message: result.error.message });
    }
  }
}
