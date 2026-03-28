import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { IVideoProcessor } from '@src/domain/repositories/IVideoProcessor';
import { IStorage } from '@src/domain/repositories/IStorage';
import { err, ok, Result } from '@src/domain/utils/Result';
import { LiveThumbnailError, StreamNotFoundError } from '@src/domain/errors/stream.errors';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

export interface CaptureLiveThumbnailDto {
  streamId: string;
  streamKey?: string;
  force?: boolean;
}

export class CaptureLiveThumbnailUseCase {
  constructor(
    private readonly streamRepository: IStreamRepository,
    private readonly userRepository: IUserRepository,
    private readonly videoProcessor: IVideoProcessor,
    private readonly storage: IStorage,
    private readonly hlsRootDir: string,
  ) {}

  async execute(
    dto: CaptureLiveThumbnailDto,
  ): Promise<Result<string | undefined, StreamNotFoundError | LiveThumbnailError>> {
    const stream = await this.streamRepository.findById(dto.streamId);
    if (!stream) {
      return err(new StreamNotFoundError(`id: ${dto.streamId}`));
    }

    if (!stream.isLive && !dto.force) {
      return ok(undefined);
    }

    let streamKey = dto.streamKey;
    if (!streamKey) {
      const user = await this.userRepository.findById(stream.userId);
      streamKey = user?.streamKey || '';
    }
    if (!streamKey) {
      return err(new LiveThumbnailError('Missing stream key'));
    }

    const playlistPath = path.join(this.hlsRootDir, `${streamKey}.m3u8`);
    let playlistContents: string;
    try {
      playlistContents = await fs.readFile(playlistPath, 'utf8');
    } catch {
      return ok(undefined);
    }

    const segmentName = this.getLastSegmentName(playlistContents);
    if (!segmentName) {
      return ok(undefined);
    }

    const segmentPath = path.join(this.hlsRootDir, segmentName);
    try {
      await fs.access(segmentPath);
    } catch {
      return ok(undefined);
    }

    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `live-thumb-${dto.streamId}-`),
    );

    try {
      const thumbnailPath = await this.videoProcessor.extractThumbnail(
        segmentPath,
        tempDir,
        '00:00:00',
      );

      const storagePath = `streams/${dto.streamId}/live`;
      await this.storage.uploadDirectory(tempDir, storagePath);

      stream.thumbnailUrl = this.storage.getPublicUrl(
        `${storagePath}/${path.basename(thumbnailPath)}`,
      );
      await this.streamRepository.update(stream);

      return ok(stream.thumbnailUrl);
    } catch (error: any) {
      return err(new LiveThumbnailError(error.message));
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private getLastSegmentName(playlistContents: string): string | null {
    const lines = playlistContents
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));

    if (lines.length === 0) {
      return null;
    }

    return lines[lines.length - 1];
  }
}
