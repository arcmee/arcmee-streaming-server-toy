import { Queue } from 'bullmq';
import { IVodProcessingQueue, VodProcessingJob } from '@src/domain/repositories/IVodProcessingQueue';
import { getRedisConnection } from './redisConnection';

export class RedisVodProcessingQueue implements IVodProcessingQueue {
  private queue: Queue;

  constructor() {
    const connection = getRedisConnection();

    this.queue = new Queue('vod-processing', { connection });

    this.queue.on('error', (error) => {
      console.error('Redis Queue Error:', error);
    });

    console.log('RedisVodProcessingQueue initialized');
  }

  async add(job: VodProcessingJob): Promise<void> {
    await this.queue.add('process-vod', job);
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
