import { IVodProcessingQueue } from '@src/domain/repositories/IVodProcessingQueue';

export class FakeVodProcessingQueue implements IVodProcessingQueue {
  public jobs: Record<string, any>[] = [];

  async add(job: Record<string, any>): Promise<void> {
    this.jobs.push(job);
  }

  async close(): Promise<void> {
    // Nothing to do in the fake implementation
  }

  clear(): void {
    this.jobs = [];
  }
}