import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { GetChannelInfoDto } from '@src/application/dtos/user/GetChannelInfo.dto';
import { err, ok, Result } from '@src/domain/utils/Result';
import { UserNotFoundError } from '@src/domain/errors/user.errors';
import { ChannelInfoResponseDto } from '@src/application/dtos/user/ChannelInfoResponse.dto';
import { UserResponseDto } from '@src/application/dtos/user/UserResponse.dto';

export class GetChannelInfoUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly streamRepository: IStreamRepository,
  ) {}

  async execute(
    dto: GetChannelInfoDto,
  ): Promise<Result<ChannelInfoResponseDto, UserNotFoundError>> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      return err(new UserNotFoundError());
    }

    const stream = await this.streamRepository.findByUserId(dto.userId);

    return ok(
      new ChannelInfoResponseDto({
        user: UserResponseDto.fromEntity(user),
        stream,
        streamKey: dto.includeStreamKey ? user.streamKey : undefined,
      }),
    );
  }
}
