import { IVideoProcessor } from '@src/domain/repositories/IVideoProcessor';
import { IStorage } from '@src/domain/repositories/IStorage';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

import { Vod } from '@src/domain/entities/vod.entity';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { IVodRepository } from '@src/domain/repositories/IVodRepository';

import { createId } from '@paralleldrive/cuid2';
import { err, ok, Result } from '@src/domain/utils/Result';
import { StreamNotFoundError } from '@src/domain/errors/stream.errors';
import {
  StorageUploadError,
  VideoProcessingError,
} from '@src/domain/errors/vod.errors';

export interface IProcessVODDTO {
  streamId: string;
  recordedFilePath: string;
}

export class ProcessVODUseCase {
  constructor(
    private readonly vodRepository: IVodRepository,
    private readonly streamRepository: IStreamRepository,
    private readonly videoProcessor: IVideoProcessor,
    private readonly storage: IStorage,
  ) {}

  async execute(
    data: IProcessVODDTO,
  ): Promise<
    Result<Vod, StreamNotFoundError | VideoProcessingError | StorageUploadError>
  > {
    console.log(
      `[ProcessVODUseCase] Start processing VOD for stream: ${data.streamId}`,
    );

    const stream = await this.streamRepository.findById(data.streamId);
    if (!stream) {
      return err(new StreamNotFoundError(`id: ${data.streamId}`));
    }

    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `vod-${data.streamId}-`),
    );

    try {
      const outputDir = path.join(tempDir, 'processed');
      await fs.mkdir(outputDir);

      console.log(
        `[ProcessVODUseCase] Transcoding video for stream: ${data.streamId}`,
      );
      const { masterPlaylistPath, duration } = await this.videoProcessor.transcodeToHLS(data.recordedFilePath, outputDir);

      console.log(
        `[ProcessVODUseCase] Extracting thumbnail for stream: ${data.streamId}`,
      );
      const thumbnailPath = await this.videoProcessor.extractThumbnail(
        data.recordedFilePath,
        outputDir,
        '00:00:01',
      );

      const storageVodPath = `vods/${data.streamId}`;
      console.log(
        `[ProcessVODUseCase] Uploading files to storage at: ${storageVodPath}`,
      );
      await this.storage.uploadDirectory(outputDir, storageVodPath);

      const newVod = new Vod({
        id: createId(),
        streamId: data.streamId,
        userId: stream.userId,
        title: `VOD - ${stream.title} - ${new Date().toLocaleDateString()}`,
        thumbnailUrl: this.storage.getPublicUrl(
          `${storageVodPath}/${path.basename(thumbnailPath)}`,
        ),
        videoUrl: this.storage.getPublicUrl(
          `${storageVodPath}/${path.basename(masterPlaylistPath)}`,
        ),
        duration,
        createdAt: new Date(),
        views: 0,
      });

      const vod = await this.vodRepository.create(newVod);
      console.log(
        `[ProcessVODUseCase] Finished processing. VOD created with ID: ${vod.id}`,
      );
      return ok(vod);
    } catch (error: any) {
      console.error(
        `[ProcessVODUseCase] Error processing VOD for stream ${data.streamId}:`,
        error,
      );
      // This is a simplification. In a real app, you might have more granular
      // error checking to differentiate between video and storage errors.
      return err(new VideoProcessingError(error.message));
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(
        `[ProcessVODUseCase] Cleaned up temporary directory: ${tempDir}`,
      );
    }
  }
}
