import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { Stream } from '@src/domain/entities/stream.entity';
import { ok, Result } from '@src/domain/utils/Result';

export class GetLiveStreamsUseCase {
  constructor(private readonly streamRepository: IStreamRepository) {}

  async execute(): Promise<Result<Stream[], never>> {
    const liveStreams = await this.streamRepository.findAllLive();
    return ok(liveStreams);
  }
}
