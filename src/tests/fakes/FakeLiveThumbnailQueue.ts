import { ILiveThumbnailQueue, LiveThumbnailJob } from '@src/domain/repositories/ILiveThumbnailQueue';

export class FakeLiveThumbnailQueue implements ILiveThumbnailQueue {
  starts: LiveThumbnailJob[] = [];
  stops: string[] = [];

  async start(job: LiveThumbnailJob): Promise<void> {
    this.starts.push(job);
  }

  async stop(streamId: string): Promise<void> {
    this.stops.push(streamId);
  }

  async close(): Promise<void> {
    // No-op for tests.
  }

  clear(): void {
    this.starts = [];
    this.stops = [];
  }
}
