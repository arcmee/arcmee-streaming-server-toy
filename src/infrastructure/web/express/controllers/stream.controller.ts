import { Request, Response } from 'express';
import { UpdateStreamStatusUseCase } from '@src/application/use-cases/stream/UpdateStreamStatus.usecase';
import { GetLiveStreamsUseCase } from '@src/application/use-cases/stream/GetLiveStreams.usecase';
import { CaptureLiveThumbnailUseCase } from '@src/application/use-cases/stream/CaptureLiveThumbnail.usecase';
import { StreamNotFoundError } from '@src/domain/errors/stream.errors';

export class StreamController {
  constructor(
    private readonly updateStreamStatusUseCase: UpdateStreamStatusUseCase,
    private readonly getLiveStreamsUseCase: GetLiveStreamsUseCase,
    private readonly captureLiveThumbnailUseCase: CaptureLiveThumbnailUseCase,
  ) {}

  // This will handle webhooks from Node-Media-Server
  async handleNmsWebhook(req: Request, res: Response): Promise<void> {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        const params = new URLSearchParams(payload);
        payload = Object.fromEntries(params.entries());
      }
    }

    const getFirst = (value: unknown): string | undefined => {
      if (typeof value === 'string') {
        return value;
      }
      if (Array.isArray(value)) {
        return value.find(item => typeof item === 'string');
      }
      return undefined;
    };

    const { streamKey, event, stream, name, action, call } = payload || {};
    const queryStreamKey =
      getFirst(req.query.streamKey) || getFirst(req.query.stream) || getFirst(req.query.name);
    const queryCall = getFirst(req.query.call);

    // Accept both our internal payload ({ streamKey, event }) and NMS defaults ({ stream/name, action })
    const resolvedStreamKey = streamKey || stream || name || queryStreamKey;
    const resolvedEvent =
      event ||
      (call === 'publish' ? 'post_publish' : undefined) ||
      (call === 'done' ? 'done_publish' : undefined) ||
      (queryCall === 'publish' ? 'post_publish' : undefined) ||
      (queryCall === 'done' ? 'done_publish' : undefined) ||
      (action === 'publish' ? 'post_publish' : undefined) ||
      (action === 'done' ? 'done_publish' : undefined) ||
      (action === 'postPublish' ? 'post_publish' : undefined) ||
      (action === 'donePublish' ? 'done_publish' : undefined);

    console.log(
      `[Webhook] received stream key=${resolvedStreamKey ?? 'unknown'} event=${resolvedEvent ?? action ?? 'unknown'}`,
    );

    // Ignore play/record notifications but return 200 to avoid NMS closing sessions
    const passiveActions = ['prePlay', 'postPlay', 'donePlay', 'postRecord', 'doneRecord'];
    if (passiveActions.includes(action)) {
      res.status(200).json({ message: 'Ignored passive event.' });
      return;
    }

    if (typeof resolvedStreamKey !== 'string' || typeof resolvedEvent !== 'string') {
      res.status(400).json({ message: 'Invalid payload.' });
      return;
    }

    // We are interested in 'done_publish' (stream ends) and 'post_publish' (stream starts)
    if (resolvedEvent !== 'post_publish' && resolvedEvent !== 'done_publish') {
      res.status(204).send(); // No content, we don't care about other events
      return;
    }

    if (!resolvedStreamKey) {
      res.status(400).json({ message: 'Stream key is required.' });
      return;
    }

    const isLive = resolvedEvent === 'post_publish';
    const result = await this.updateStreamStatusUseCase.execute({
      streamKey: resolvedStreamKey,
      isLive,
    });

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

  async refreshLiveThumbnail(req: Request, res: Response): Promise<void> {
    const { streamId } = req.params;
    const { streamKey } = req.body || {};

    if (!streamId) {
      res.status(400).json({ message: 'streamId is required.' });
      return;
    }

    const result = await this.captureLiveThumbnailUseCase.execute({
      streamId,
      streamKey,
      force: true,
    });

    if (result.ok) {
      if (result.value) {
        res.status(200).json({ thumbnailUrl: result.value });
      } else {
        res.status(202).json({ message: 'Thumbnail capture skipped.' });
      }
      return;
    }

    if (result.error instanceof StreamNotFoundError) {
      res.status(404).json({ message: 'Stream not found.' });
      return;
    }

    res.status(500).json({ message: 'Failed to refresh thumbnail.' });
  }
}
