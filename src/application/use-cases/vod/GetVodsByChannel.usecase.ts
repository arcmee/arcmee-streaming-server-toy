import { Vod } from "@src/domain/entities/vod.entity";
import { IVodRepository } from "@src/domain/repositories/IVodRepository";

export interface IGetVodsByChannelDTO {
  channelId: string; // This is the userId
}

export class GetVodsByChannelUseCase {
  constructor(private readonly vodRepository: IVodRepository) {}

  async execute(data: IGetVodsByChannelDTO): Promise<Vod[]> {
    return this.vodRepository.findByUserId(data.channelId);
  }
}
