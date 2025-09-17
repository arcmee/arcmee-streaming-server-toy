import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { IStreamRepository } from '../../../../domain/repositories/IStreamRepository';
import { UpdateStreamStatusDto } from '../../dtos/stream/UpdateStreamStatus.dto';
import { IVodProcessingQueue } from '../../../../domain/repositories/IVodProcessingQueue';

export class UpdateStreamStatusUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly streamRepository: IStreamRepository,
    private readonly vodProcessingQueue: IVodProcessingQueue,
  ) {}

  async execute(dto: UpdateStreamStatusDto): Promise<void> {
    const user = await this.userRepository.findByStreamKey(dto.streamKey);
    if (!user) {
      console.warn(`Invalid stream key used: ${dto.streamKey}`);
      return;
    }

    const stream = await this.streamRepository.findByUserId(user.id);
    if (!stream) {
      throw new Error(`Stream not found for user ${user.id}`);
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
  }
}
