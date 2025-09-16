import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { IStreamRepository } from '../../../../domain/repositories/IStreamRepository';
import { UpdateStreamStatusDto } from '../../dtos/stream/UpdateStreamStatus.dto';

export class UpdateStreamStatusUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly streamRepository: IStreamRepository,
  ) {}

  async execute(dto: UpdateStreamStatusDto): Promise<void> {
    const user = await this.userRepository.findByStreamKey(dto.streamKey);
    if (!user) {
      // In a real scenario, you might want to log this invalid attempt.
      console.warn(`Invalid stream key used: ${dto.streamKey}`);
      // We don't throw an error to prevent attackers from knowing if a stream key is valid.
      return;
    }

    const stream = await this.streamRepository.findByUserId(user.id);
    if (!stream) {
      // This case should ideally not happen if every user has a stream.
      // Throwing an error here as it indicates a data integrity issue.
      throw new Error(`Stream not found for user ${user.id}`);
    }

    stream.isLive = dto.isLive;

    await this.streamRepository.update(stream);
  }
}
