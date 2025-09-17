import { Queue } from 'bullmq';
import { IVodProcessingQueue } from '../../../../domain/repositories/IVodProcessingQueue';

export class RedisVodProcessingQueue implements IVodProcessingQueue {
  private queue: Queue;

  constructor() {
    // In a real application, the Redis connection details would come from a config file.
    this.queue = new Queue('vod-processing', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });
    console.log('RedisVodProcessingQueue initialized');
  }

  async add(job: { streamId: string; videoUrl: string }): Promise<void> {
    await this.queue.add('process-vod', job);
    console.log(`Added VOD processing job for stream ${job.streamId} to the queue`);
  }
}
