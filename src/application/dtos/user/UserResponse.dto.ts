import { User } from '@src/domain/entities/user.entity';

export class UserResponseDto {
  id: string;
  username: string;
  email: string;

  constructor(props: {
    id: string;
    username: string;
    email: string;
  }) {
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
  }

  static fromEntity(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id!,
      username: user.username,
      email: user.email,
    });
  }
}
