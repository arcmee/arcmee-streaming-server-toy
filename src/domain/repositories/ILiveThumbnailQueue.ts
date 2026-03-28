export interface LiveThumbnailJob {
  streamId: string;
  streamKey: string;
}

export interface ILiveThumbnailQueue {
  start(job: LiveThumbnailJob): Promise<void>;
  stop(streamId: string): Promise<void>;
  close(): Promise<void>;
}
