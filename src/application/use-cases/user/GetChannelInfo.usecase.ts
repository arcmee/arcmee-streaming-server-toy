import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { GetChannelInfoDto } from '@src/application/dtos/user/GetChannelInfo.dto';
import { User } from '@src/domain/entities/user.entity';
import { Stream } from '@src/domain/entities/stream.entity';
import { err, ok, Result } from '@src/domain/utils/Result';
import { UserNotFoundError } from '@src/domain/errors/user.errors';

interface ChannelInfo {
  user: Omit<User, 'password' | 'streamKey'>;
  stream: Stream | null;
}

export class GetChannelInfoUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly streamRepository: IStreamRepository,
  ) {}

  async execute(
    dto: GetChannelInfoDto,
  ): Promise<Result<ChannelInfo, UserNotFoundError>> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      return err(new UserNotFoundError());
    }

    const stream = await this.streamRepository.findByUserId(dto.userId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, streamKey, ...publicUser } = user;

    return ok({
      user: publicUser,
      stream,
    });
  }
}