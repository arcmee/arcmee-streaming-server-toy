import { IVideoProcessor } from '@src/domain/repositories/IVideoProcessor';
import { IStorage } from '@src/domain/repositories/IStorage';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

import { Vod } from '@src/domain/entities/vod.entity';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { IVodRepository } from '@src/domain/repositories/IVodRepository';

import { createId } from '@paralleldrive/cuid2';

export interface IProcessVODDTO {
  streamId: string;
  // In a real scenario, you'd get the path to the recorded file
  // from the media server webhook payload.
  recordedFilePath: string; 
}

export class ProcessVODUseCase {
  constructor(
    private readonly vodRepository: IVodRepository,
    private readonly streamRepository: IStreamRepository,
    private readonly videoProcessor: IVideoProcessor,
    private readonly storage: IStorage
  ) {}

  async execute(data: IProcessVODDTO): Promise<Vod> {
    console.log(`[ProcessVODUseCase] Start processing VOD for stream: ${data.streamId}`);

    const stream = await this.streamRepository.findById(data.streamId);
    if (!stream) {
      throw new Error(`Stream with id ${data.streamId} not found.`);
    }

    // 1. Create a temporary directory for processing
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `vod-${data.streamId}-`));
    const outputDir = path.join(tempDir, 'processed');
    await fs.mkdir(outputDir);

    try {
      // 2. Transcode video to HLS
      console.log(`[ProcessVODUseCase] Transcoding video for stream: ${data.streamId}`);
      const { masterPlaylistPath, duration } = await this.videoProcessor.transcodeToHLS(data.recordedFilePath, outputDir);
      console.log(`[ProcessVODUseCase] Transcoding complete. Master playlist at: ${masterPlaylistPath}`);

      // 3. Extract a thumbnail
      console.log(`[ProcessVODUseCase] Extracting thumbnail for stream: ${data.streamId}`);
      const thumbnailPath = await this.videoProcessor.extractThumbnail(data.recordedFilePath, outputDir, '00:00:01');
      console.log(`[ProcessVODUseCase] Thumbnail extracted to: ${thumbnailPath}`);

      // 4. Upload processed files to storage
      const storageVodPath = `vods/${data.streamId}`;
      console.log(`[ProcessVODUseCase] Uploading files to storage at: ${storageVodPath}`);
      await this.storage.uploadDirectory(outputDir, storageVodPath);
      console.log(`[ProcessVODUseCase] Upload complete.`);

      // 5. Create VOD entity with public URLs
      const newVod = new Vod({
        id: createId(),
        streamId: data.streamId,
        userId: stream.userId,
        title: `VOD - ${stream.title} - ${new Date().toLocaleDateString()}`,
        thumbnailUrl: this.storage.getPublicUrl(`${storageVodPath}/${path.basename(thumbnailPath)}`),
        videoUrl: this.storage.getPublicUrl(`${storageVodPath}/${path.basename(masterPlaylistPath)}`),
        duration,
        createdAt: new Date(),
        views: 0,
      });

      // 6. Save VOD to database
      const vod = await this.vodRepository.create(newVod);
      console.log(`[ProcessVODUseCase] Finished processing. VOD created with ID: ${vod.id}`);
      return vod;

    } catch (error) {
      console.error(`[ProcessVODUseCase] Error processing VOD for stream ${data.streamId}:`, error);
      // Re-throw the error to be caught by the worker
      throw error;
    } finally {
      // 7. Clean up temporary directory
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`[ProcessVODUseCase] Cleaned up temporary directory: ${tempDir}`);
    }
  }
}
