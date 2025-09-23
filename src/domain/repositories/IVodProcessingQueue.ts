export interface IVodProcessingQueue {
  add(job: { streamId: string; videoUrl: string }): Promise<void>;
  close(): Promise<void>;
}
