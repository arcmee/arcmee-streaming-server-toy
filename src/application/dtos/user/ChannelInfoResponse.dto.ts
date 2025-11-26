import { Stream } from '@src/domain/entities/stream.entity';
import { UserResponseDto } from './UserResponse.dto';

export class ChannelInfoResponseDto {
  user: UserResponseDto;
  stream: Stream | null;
  streamKey?: string;

  constructor(props: {
    user: UserResponseDto;
    stream: Stream | null;
    streamKey?: string;
  }) {
    this.user = props.user;
    this.stream = props.stream;
    this.streamKey = props.streamKey;
  }
}
