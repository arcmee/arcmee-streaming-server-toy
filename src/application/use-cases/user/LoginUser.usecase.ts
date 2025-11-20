import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { LoginUserDto } from '@src/application/dtos/user/LoginUser.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { err, ok, Result } from '@src/domain/utils/Result';
import { InvalidCredentialsError } from '@src/domain/errors/user.errors';
import { AppConfig } from '@src/infrastructure/config';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly config: AppConfig,
  ) {}

  async execute(
    dto: LoginUserDto,
  ): Promise<Result<{ token: string }, InvalidCredentialsError>> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      return err(new InvalidCredentialsError());
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      return err(new InvalidCredentialsError());
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, this.config.jwt.secret, {
      expiresIn: this.config.jwt.expiresIn,
      issuer: this.config.jwt.issuer,
      algorithm: this.config.jwt.algorithm,
    });

    return ok({ token });
  }
}
