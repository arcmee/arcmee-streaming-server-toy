import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { IStreamRepository } from '../../../../domain/repositories/IStreamRepository';
import { GetChannelInfoDto } from '../../dtos/user/GetChannelInfo.dto';
import { User } from '../../../../domain/entities/user.entity';
import { Stream } from '../../../../domain/entities/stream.entity';

interface ChannelInfo {
  user: Omit<User, 'password' | 'streamKey'>;
  stream: Stream | null;
}

export class GetChannelInfoUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly streamRepository: IStreamRepository,
  ) {}

  async execute(dto: GetChannelInfoDto): Promise<ChannelInfo> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const stream = await this.streamRepository.findByUserId(dto.userId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, streamKey, ...publicUser } = user;

    return {
      user: publicUser,
      stream,
    };
  }
}