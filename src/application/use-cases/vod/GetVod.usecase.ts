import { Vod } from '@src/domain/entities/vod.entity';
import { IVodRepository } from '@src/domain/repositories/IVodRepository';
import { err, ok, Result } from '@src/domain/utils/Result';
import { VodNotFoundError } from '@src/domain/errors/vod.errors';

export interface IGetVodDTO {
  vodId: string;
}

export class GetVodUseCase {
  constructor(private readonly vodRepository: IVodRepository) {}

  async execute(data: IGetVodDTO): Promise<Result<Vod, VodNotFoundError>> {
    const vod = await this.vodRepository.findById(data.vodId);

    if (!vod) {
      return err(new VodNotFoundError());
    }

    // In a real application, you might want to increment the view count here.
    // This could be a separate use case like `IncrementVodViewCountUseCase`
    // to avoid violating the single responsibility principle.

    return ok(vod);
  }
}
