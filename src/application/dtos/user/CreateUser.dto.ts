import { User } from '../../../domain/entities/user.entity';

export class CreateUserDto {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}