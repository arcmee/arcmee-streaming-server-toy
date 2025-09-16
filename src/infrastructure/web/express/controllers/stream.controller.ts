import { Request, Response } from 'express';
import { UpdateStreamStatusUseCase } from '../../../application/use-cases/stream/UpdateStreamStatus.usecase';
import { GetLiveStreamsUseCase } from '../../../application/use-cases/stream/GetLiveStreams.usecase';

export class StreamController {
  constructor(
    private readonly updateStreamStatusUseCase: UpdateStreamStatusUseCase,
    private readonly getLiveStreamsUseCase: GetLiveStreamsUseCase,
  ) {}

  // This will handle webhooks from Node-Media-Server
  async handleNmsWebhook(req: Request, res: Response): Promise<void> {
    const { streamKey, event } = req.body;

    // We are interested in 'done_publish' (stream ends) and 'post_publish' (stream starts)
    if (event !== 'post_publish' && event !== 'done_publish') {
      res.status(204).send(); // No content, we don't care about other events
      return;
    }

    if (!streamKey) {
      res.status(400).json({ message: 'Stream key is required.' });
      return;
    }

    try {
      const isLive = event === 'post_publish';
      await this.updateStreamStatusUseCase.execute({ streamKey, isLive });
      res.status(200).json({ message: 'Stream status updated.' });
    } catch (error: any) {
      // Log the error but send a generic response
      console.error('Error updating stream status:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }

  async getLiveStreams(req: Request, res: Response): Promise<void> {
    try {
      const liveStreams = await this.getLiveStreamsUseCase.execute();
      res.status(200).json(liveStreams);
    } catch (error: any) {
      console.error('Error getting live streams:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
}
