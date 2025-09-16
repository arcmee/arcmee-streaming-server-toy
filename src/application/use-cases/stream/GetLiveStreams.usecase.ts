import { IStreamRepository } from '../../../../domain/repositories/IStreamRepository';
import { Stream } from '../../../../domain/entities/stream.entity';

export class GetLiveStreamsUseCase {
  constructor(private readonly streamRepository: IStreamRepository) {}

  async execute(): Promise<Stream[]> {
    // This requires a new method in the repository to find all live streams.
    // We will add `findAllLive()` to `IStreamRepository`.
    return this.streamRepository.findAllLive();
  }
}
