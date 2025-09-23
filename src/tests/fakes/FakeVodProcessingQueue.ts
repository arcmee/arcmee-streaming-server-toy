import { IVodProcessingQueue } from "@src/domain/repositories/IVodProcessingQueue";

export class FakeVodProcessingQueue implements IVodProcessingQueue {
  public jobs: { streamId: string; videoUrl: string }[] = [];

  async add(job: { streamId: string; videoUrl: string }): Promise<void> {
    this.jobs.push(job);
    return Promise.resolve();
  }

  // Helper for tests to clear jobs
  clearJobs() {
    this.jobs = [];
  }

  async close(): Promise<void> {
    // Do nothing in fake
    return Promise.resolve();
  }
}
