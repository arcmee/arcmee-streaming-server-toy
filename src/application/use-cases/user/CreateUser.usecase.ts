import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { User } from '@src/domain/entities/user.entity';
import { CreateUserDto } from '@src/application/dtos/user/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { Stream } from '@src/domain/entities/stream.entity';
import { createId } from '@paralleldrive/cuid2';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly streamRepository: IStreamRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new User({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      streamKey: createId(),
    });

    const createdUser = await this.userRepository.create(user);

    // Create a stream for the new user
    const stream = new Stream({
      userId: createdUser.id!,
      title: `${createdUser.username}'s Stream`,
      description: '',
      isLive: false,
      thumbnailUrl: null,
    });

    await this.streamRepository.create(stream);

    return createdUser;
  }
}