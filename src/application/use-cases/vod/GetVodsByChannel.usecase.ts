import { Vod } from '@src/domain/entities/vod.entity';
import { IVodRepository } from '@src/domain/repositories/IVodRepository';
import { ok, Result } from '@src/domain/utils/Result';

export interface IGetVodsByChannelDTO {
  channelId: string; // This is the userId
}

export class GetVodsByChannelUseCase {
  constructor(private readonly vodRepository: IVodRepository) {}

  async execute(data: IGetVodsByChannelDTO): Promise<Result<Vod[], never>> {
    const vods = await this.vodRepository.findByUserId(data.channelId);
    return ok(vods);
  }
}
