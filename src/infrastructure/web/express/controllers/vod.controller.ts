import { Request, Response } from 'express';
import { GetVodsByChannelUseCase } from '@src/application/use-cases/vod/GetVodsByChannel.usecase';
import { GetVodUseCase } from '@src/application/use-cases/vod/GetVod.usecase';

export class VodController {
  constructor(
    private readonly getVodsByChannelUseCase: GetVodsByChannelUseCase,
    private readonly getVodUseCase: GetVodUseCase,
  ) {}

  async getVodsByChannel(req: Request, res: Response): Promise<Response> {
    try {
      const { channelId } = req.params;
      const vods = await this.getVodsByChannelUseCase.execute({ channelId });
      return res.status(200).json(vods);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ message: 'Failed to get VODs', error: errorMessage });
    }
  }

  async getVodById(req: Request, res: Response): Promise<Response> {
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
