import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { Stream } from '@src/domain/entities/stream.entity';
import { ok, Result } from '@src/domain/utils/Result';

export type LiveStreamResponse = Stream & { streamKey?: string };

export class GetLiveStreamsUseCase {
  constructor(
    private readonly streamRepository: IStreamRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<Result<LiveStreamResponse[], never>> {
    const liveStreams = await this.streamRepository.findAllLive();
    const streamsWithKeys: LiveStreamResponse[] = [];

    for (const stream of liveStreams) {
      const user = await this.userRepository.findById(stream.userId);
      streamsWithKeys.push({
        ...stream,
        streamKey: user?.streamKey,
      });
    }

    return ok(streamsWithKeys);
  }
}
