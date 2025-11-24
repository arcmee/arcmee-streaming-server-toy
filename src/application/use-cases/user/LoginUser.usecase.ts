import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { LoginUserDto } from '@src/application/dtos/user/LoginUser.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { err, ok, Result } from '@src/domain/utils/Result';
import { InvalidCredentialsError } from '@src/domain/errors/user.errors';
import { AppConfig } from '@src/infrastructure/config';
import { RefreshTokenManager } from '@src/application/services/RefreshTokenManager';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly config: AppConfig,
    private readonly refreshTokenManager: RefreshTokenManager,
  ) {}

  async execute(
    dto: LoginUserDto,
  ): Promise<Result<{ token: string; refreshToken: string }, InvalidCredentialsError>> {
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

    const { token: refreshToken } = await this.refreshTokenManager.issue(user.id);

    return ok({ token, refreshToken });
  }
}
