import { IVodProcessingQueue } from '@src/domain/repositories/IVodProcessingQueue';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { ok, Result } from '@src/domain/utils/Result';
import { UploadVodDto } from '../../dtos/vod/UploadVod.dto';

export class UploadVodUseCase {
  constructor(
    private readonly vodProcessingQueue: IVodProcessingQueue,
    private readonly streamRepository: IStreamRepository,
  ) {}

  async execute(dto: UploadVodDto): Promise<Result<void, never>> {
    // TODO: Add validation for DTO properties

    const stream = await this.streamRepository.findByUserId(dto.userId);
    if (!stream) {
      throw new Error('Stream not found for user.');
    }

    await this.vodProcessingQueue.add({
      streamId: stream.id,
      recordedFilePath: dto.originalPath,
    });

    console.log(
      `[UploadVodUseCase] VOD processing job added to queue for file: ${dto.originalPath}`,
    );

    return ok(undefined);
  }
}
