import { Stream } from '@src/domain/entities/stream.entity';
import { UserResponseDto } from './UserResponse.dto';

export class ChannelInfoResponseDto {
  user: UserResponseDto;
  stream: Stream | null;

  constructor(props: {
    user: UserResponseDto;
    stream: Stream | null;
  }) {
    this.user = props.user;
    this.stream = props.stream;
  }
}
