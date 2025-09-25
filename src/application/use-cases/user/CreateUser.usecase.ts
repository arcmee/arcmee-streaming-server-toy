import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { User } from '@src/domain/entities/user.entity';
import { CreateUserDto } from '@src/application/dtos/user/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { Stream } from '@src/domain/entities/stream.entity';
import { createId } from '@paralleldrive/cuid2';
import { err, ok, Result } from '@src/domain/utils/Result';
import { DuplicateUserError } from '@src/domain/errors/user.errors';
import { AppConfig } from '@src/infrastructure/config';
import * as jwt from 'jsonwebtoken';
import { UserResponseDto } from '@src/application/dtos/user/UserResponse.dto';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly streamRepository: IStreamRepository,
    private readonly config: AppConfig,
  ) {}

  async execute(
    dto: CreateUserDto,
  ): Promise<Result<{ user: UserResponseDto; token: string }, DuplicateUserError>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      return err(new DuplicateUserError());
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
      title: `${createdUser.username}\'s Stream`,
      description: '',
      isLive: false,
      thumbnailUrl: null,
    });

    await this.streamRepository.create(stream);

    const token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      this.config.jwt.secret,
      {
        expiresIn: this.config.jwt.expiresIn,
      },
    );

    return ok({ user: UserResponseDto.fromEntity(createdUser), token });
  }
}