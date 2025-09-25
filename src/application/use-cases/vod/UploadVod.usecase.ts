import { IVodProcessingQueue } from '@src/domain/repositories/IVodProcessingQueue';
import { ok, Result } from '@src/domain/utils/Result';
import { UploadVodDto } from '../../dtos/vod/UploadVod.dto';

export class UploadVodUseCase {
  constructor(private readonly vodProcessingQueue: IVodProcessingQueue) {}

  async execute(dto: UploadVodDto): Promise<Result<void, never>> {
    // TODO: Add validation for DTO properties

    await this.vodProcessingQueue.add({
      ...dto,
    });

    console.log(
      `[UploadVodUseCase] VOD processing job added to queue for file: ${dto.originalPath}`,
    );

    return ok(undefined);
  }
}
