import * as jwt from 'jsonwebtoken';
import { RefreshTokenManager } from '@src/application/services/RefreshTokenManager';
import { RefreshAccessTokenDto } from '@src/application/dtos/auth/RefreshAccessToken.dto';
import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { err, ok, Result } from '@src/domain/utils/Result';
import {
  ExpiredRefreshTokenError,
  InvalidRefreshTokenError,
  RevokedRefreshTokenError,
} from '@src/domain/errors/auth.errors';
import { AppConfig } from '@src/infrastructure/config';

type RefreshErrors = InvalidRefreshTokenError | ExpiredRefreshTokenError | RevokedRefreshTokenError;

export class RefreshAccessTokenUseCase {
  constructor(
    private readonly refreshTokenManager: RefreshTokenManager,
    private readonly userRepository: IUserRepository,
    private readonly config: AppConfig,
  ) {}

  async execute(
    dto: RefreshAccessTokenDto,
  ): Promise<Result<{ token: string; refreshToken: string }, RefreshErrors>> {
    const validation = await this.refreshTokenManager.validate(dto.refreshToken);

    if (
      validation.status === 'invalid_format' ||
      validation.status === 'not_found' ||
      validation.status === 'mismatch'
    ) {
      return err(new InvalidRefreshTokenError());
    }

    if (validation.status === 'revoked') {
      // Reuse attempt of a revoked token: revoke all sessions for safety
      await this.refreshTokenManager.revokeAllForUser(validation.token.userId);
      return err(new RevokedRefreshTokenError());
    }

    if (validation.status === 'expired') {
      await this.refreshTokenManager.revoke(validation.token.id);
      return err(new ExpiredRefreshTokenError());
    }

    const tokenRecord = validation.token;

    const user = await this.userRepository.findById(tokenRecord.userId);
    if (!user) {
      await this.refreshTokenManager.revoke(tokenRecord.id);
      return err(new InvalidRefreshTokenError());
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      this.config.jwt.secret,
      {
        expiresIn: this.config.jwt.expiresIn,
        issuer: this.config.jwt.issuer,
        algorithm: this.config.jwt.algorithm,
      },
    );

    // Rotate: revoke the old one and issue a new refresh token
    await this.refreshTokenManager.revoke(tokenRecord.id);
    const { token: newRefreshToken } = await this.refreshTokenManager.issue(user.id);

    return ok({ token: accessToken, refreshToken: newRefreshToken });
  }
}
