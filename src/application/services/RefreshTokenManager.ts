import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';
import { RefreshToken } from '@src/domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '@src/domain/repositories/IRefreshTokenRepository';
import { AppConfig } from '@src/infrastructure/config';

type ValidationResult =
  | { status: 'valid'; token: RefreshToken }
  | { status: 'expired'; token: RefreshToken }
  | { status: 'revoked'; token: RefreshToken }
  | { status: 'mismatch' }
  | { status: 'not_found' }
  | { status: 'invalid_format' };

export class RefreshTokenManager {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly config: AppConfig,
  ) {}

  private buildCompositeToken(id: string, secret: string): string {
    return `${id}.${secret}`;
  }

  private parseCompositeToken(token: string): { id: string; secret: string } | null {
    const parts = token.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return null;
    }
    return { id: parts[0], secret: parts[1] };
  }

  private generateSecret(): string {
    return randomBytes(this.config.refreshToken.length).toString('hex');
  }

  async issue(userId: string): Promise<{ token: string; stored: RefreshToken }> {
    const tokenId = createId();
    const secret = this.generateSecret();
    const tokenHash = await bcrypt.hash(secret, this.config.refreshToken.hashingRounds);
    const expiresAt = new Date(Date.now() + this.config.refreshToken.expiresInMs);

    const refreshToken = new RefreshToken({
      id: tokenId,
      tokenHash,
      userId,
      expiresAt,
    });

    const stored = await this.refreshTokenRepository.create(refreshToken);

    return {
      token: this.buildCompositeToken(stored.id, secret),
      stored,
    };
  }

  async validate(tokenString: string): Promise<ValidationResult> {
    const parsed = this.parseCompositeToken(tokenString);
    if (!parsed) {
      return { status: 'invalid_format' };
    }

    const stored = await this.refreshTokenRepository.findById(parsed.id);
    if (!stored) {
      return { status: 'not_found' };
    }

    const isMatch = await bcrypt.compare(parsed.secret, stored.tokenHash);
    if (!isMatch) {
      return { status: 'mismatch' };
    }

    if (stored.revokedAt) {
      return { status: 'revoked', token: stored };
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      return { status: 'expired', token: stored };
    }

    return { status: 'valid', token: stored };
  }

  async revoke(tokenId: string): Promise<void> {
    await this.refreshTokenRepository.revokeById(tokenId, new Date());
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(userId, new Date());
  }
}
