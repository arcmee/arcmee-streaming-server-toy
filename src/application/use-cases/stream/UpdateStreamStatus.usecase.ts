import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { UpdateStreamStatusDto } from '@src/application/dtos/stream/UpdateStreamStatus.dto';
import { IVodProcessingQueue } from '@src/domain/repositories/IVodProcessingQueue';
import * as path from 'path';
import { err, ok, Result } from '@src/domain/utils/Result';
import { UserNotFoundError } from '@src/domain/errors/user.errors';
import { StreamNotFoundError } from '@src/domain/errors/stream.errors';

export class UpdateStreamStatusUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly streamRepository: IStreamRepository,
    private readonly vodProcessingQueue: IVodProcessingQueue,
  ) {}

  async execute(
    dto: UpdateStreamStatusDto,
  ): Promise<Result<void, UserNotFoundError | StreamNotFoundError>> {
    const user = await this.userRepository.findByStreamKey(dto.streamKey);
    if (!user) {
      return err(new UserNotFoundError());
    }

    const stream = await this.streamRepository.findByUserId(user.id);
    if (!stream) {
      return err(new StreamNotFoundError(`user id: ${user.id}`));
    }

    // If the stream is stopping, add a VOD processing job to the queue.
    if (stream.isLive && !dto.isLive) {
      // In a real implementation, this path would come from the media server event payload.
      // Default to HLS master playlist location for VOD processing.
      const recordedFilePath = path.join('path', 'to', 'recordings', `${dto.streamKey}.m3u8`);
      await this.vodProcessingQueue.add({ streamId: stream.id, recordedFilePath });
    }

    stream.isLive = dto.isLive;

    await this.streamRepository.update(stream);

    return ok(undefined);
  }
}
