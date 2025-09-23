import { Queue } from 'bullmq';
import { IVodProcessingQueue } from '@src/domain/repositories/IVodProcessingQueue';

export class RedisVodProcessingQueue implements IVodProcessingQueue {
  private queue: Queue;

  constructor() {
    const connection = {
      host: process.env.REDIS_URL ? new URL(process.env.REDIS_URL).hostname : 'localhost',
      port: process.env.REDIS_URL ? parseInt(new URL(process.env.REDIS_URL).port) : 6379,
    };

    this.queue = new Queue('vod-processing', { connection });

    this.queue.on('error', (error) => {
        console.error('Redis Queue Error:', error);
    });

    console.log('RedisVodProcessingQueue initialized');
  }

  async add(job: { streamId: string; videoUrl: string }): Promise<void> {
    await this.queue.add('process-vod', job);
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
