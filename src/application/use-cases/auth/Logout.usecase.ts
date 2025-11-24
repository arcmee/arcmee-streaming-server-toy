import { LogoutDto } from '@src/application/dtos/auth/Logout.dto';
import { RefreshTokenManager } from '@src/application/services/RefreshTokenManager';
import { InvalidRefreshTokenError } from '@src/domain/errors/auth.errors';
import { err, ok, Result } from '@src/domain/utils/Result';

export class LogoutUseCase {
  constructor(private readonly refreshTokenManager: RefreshTokenManager) {}

  async execute(dto: LogoutDto): Promise<Result<void, InvalidRefreshTokenError>> {
    const validation = await this.refreshTokenManager.validate(dto.refreshToken);

    if (
      validation.status === 'invalid_format' ||
      validation.status === 'not_found' ||
      validation.status === 'mismatch'
    ) {
      return err(new InvalidRefreshTokenError());
    }

    // Idempotent logout: mark revoked when valid/expired/revoked
    if (validation.status === 'valid' || validation.status === 'expired' || validation.status === 'revoked') {
      await this.refreshTokenManager.revoke(validation.token.id);
    }

    return ok(undefined);
  }
}
