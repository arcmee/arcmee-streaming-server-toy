import { IVodProcessingQueue, VodProcessingJob } from '@src/domain/repositories/IVodProcessingQueue';

export class FakeVodProcessingQueue implements IVodProcessingQueue {
  public jobs: VodProcessingJob[] = [];

  async add(job: VodProcessingJob): Promise<void> {
    this.jobs.push(job);
  }

  async close(): Promise<void> {
    // Nothing to do in the fake implementation
  }

  clear(): void {
    this.jobs = [];
  }
}
