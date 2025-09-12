import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IStreamRepository } from '../../../domain/repositories/IStreamRepository';
import { GetChannelInfoInputDto, GetChannelInfoOutputDto } from '../../dtos/user/GetChannelInfo.dto';

export class GetChannelInfoUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly streamRepository: IStreamRepository
  ) {}

  async execute(input: GetChannelInfoInputDto): Promise<GetChannelInfoOutputDto> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const stream = await this.streamRepository.findByUserId(input.userId);
    if (!stream) {
      // 스트림 정보가 없는 경우, 에러를 발생시킵니다.
      // 또는 여기서 기본 스트림을 생성하는 정책을 가질 수도 있습니다.
      throw new Error('Stream information not found for this user.');
    }

    return {
      userId: user.id,
      username: user.username,
      streamKey: user.streamKey || '',
      streamTitle: stream.title,
      streamDescription: stream.description,
      isLive: stream.isLive,
    };
  }
}
