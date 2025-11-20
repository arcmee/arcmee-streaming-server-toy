import { Request, Response } from 'express';
import { UpdateStreamStatusUseCase } from '@src/application/use-cases/stream/UpdateStreamStatus.usecase';
import { GetLiveStreamsUseCase } from '@src/application/use-cases/stream/GetLiveStreams.usecase';

export class StreamController {
  constructor(
    private readonly updateStreamStatusUseCase: UpdateStreamStatusUseCase,
    private readonly getLiveStreamsUseCase: GetLiveStreamsUseCase,
  ) {}

  // This will handle webhooks from Node-Media-Server
  async handleNmsWebhook(req: Request, res: Response): Promise<void> {
    const { streamKey, event } = req.body;

    if (typeof streamKey !== 'string' || typeof event !== 'string') {
      res.status(400).json({ message: 'Invalid payload.' });
      return;
    }

    // We are interested in 'done_publish' (stream ends) and 'post_publish' (stream starts)
    if (event !== 'post_publish' && event !== 'done_publish') {
      res.status(204).send(); // No content, we don't care about other events
      return;
    }

    if (!streamKey) {
      res.status(400).json({ message: 'Stream key is required.' });
      return;
    }

    const isLive = event === 'post_publish';
    const result = await this.updateStreamStatusUseCase.execute({ streamKey, isLive });

    if (result.ok) {
      res.status(200).json({ message: 'Stream status updated.' });
    } else {
      // Log the error but send a generic response for security
      console.error('Error updating stream status from webhook:', result.error);
      res.status(404).json({ message: 'User or stream not found.' });
    }
  }

  async getLiveStreams(req: Request, res: Response): Promise<void> {
    const result = await this.getLiveStreamsUseCase.execute();
    if (result.ok) {
      res.status(200).json(result.value);
    } else {
      res.status(500).json({ message: 'Failed to fetch live streams.' });
    }
  }
}
