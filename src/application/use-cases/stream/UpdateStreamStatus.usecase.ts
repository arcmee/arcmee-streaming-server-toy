import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { UpdateStreamStatusDto } from '@src/application/dtos/stream/UpdateStreamStatus.dto';
import { IVodProcessingQueue } from '@src/domain/repositories/IVodProcessingQueue';
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
      // In a real implementation, you'd get the actual video URL from the media server event.
      // For now, we'll use a placeholder.
      const videoUrl = `path/to/recordings/${dto.streamKey}.flv`;
      await this.vodProcessingQueue.add({ streamId: stream.id, videoUrl });
    }

    stream.isLive = dto.isLive;

    await this.streamRepository.update(stream);

    return ok(undefined);
  }
}
