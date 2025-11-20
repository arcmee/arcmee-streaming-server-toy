export interface VodProcessingJob {
  streamId: string;
  recordedFilePath: string;
}

export interface IVodProcessingQueue {
  add(job: VodProcessingJob): Promise<void>;
  close(): Promise<void>;
}
