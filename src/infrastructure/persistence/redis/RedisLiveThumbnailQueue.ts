import { Queue } from 'bullmq';
import { ILiveThumbnailQueue, LiveThumbnailJob } from '@src/domain/repositories/ILiveThumbnailQueue';
import { getRedisConnection } from './redisConnection';

export class RedisLiveThumbnailQueue implements ILiveThumbnailQueue {
  private queue: Queue;
  private readonly intervalMs: number;

  constructor() {
    const connection = getRedisConnection();
    this.intervalMs = Number(process.env.LIVE_THUMBNAIL_INTERVAL_MS) || 15000;

    this.queue = new Queue('live-thumbnail', { connection });

    this.queue.on('error', (error) => {
      console.error('Redis Live Thumbnail Queue Error:', error);
    });

    console.log('RedisLiveThumbnailQueue initialized');
  }

  async start(job: LiveThumbnailJob): Promise<void> {
    await this.queue.upsertJobScheduler(
      this.getJobId(job.streamId),
      { every: this.intervalMs },
      {
        name: 'capture-live-thumbnail',
        data: job,
        opts: {
          removeOnComplete: true,
          removeOnFail: true,
        },
      },
    );
  }

  async stop(streamId: string): Promise<void> {
    const jobId = this.getJobId(streamId);
    try {
      await this.queue.removeJobScheduler(jobId);
    } catch (error) {
      console.warn('Failed to remove live thumbnail scheduler:', error);
    }
  }

  async close(): Promise<void> {
    await this.queue.close();
  }

  private getJobId(streamId: string): string {
    return `live-thumbnail:${streamId}`;
  }
}
