import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { User } from '@src/domain/entities/user.entity';
import { CreateUserDto } from '@src/application/dtos/user/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { Stream } from '@src/domain/entities/stream.entity';
import { createId } from '@paralleldrive/cuid2';
import { err, ok, Result } from '@src/domain/utils/Result';
import { DuplicateUserError } from '@src/domain/errors/user.errors';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly streamRepository: IStreamRepository,
  ) {}

  async execute(
    dto: CreateUserDto,
  ): Promise<Result<{ user: User; token: string }, DuplicateUserError>> {
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

    const secretKey = 'your-super-secret-key'; // Should be in env vars
    const token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      secretKey,
      {
        expiresIn: '1h',
      },
    );

    return ok({ user: createdUser, token });
  }
}