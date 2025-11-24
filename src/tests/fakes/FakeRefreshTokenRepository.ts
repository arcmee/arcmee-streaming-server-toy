import { RefreshToken } from '@src/domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '@src/domain/repositories/IRefreshTokenRepository';

export class FakeRefreshTokenRepository implements IRefreshTokenRepository {
  private tokens: RefreshToken[] = [];

  async create(token: RefreshToken): Promise<RefreshToken> {
    this.tokens.push(token);
    return token;
  }

  async findById(id: string): Promise<RefreshToken | null> {
    return this.tokens.find(token => token.id === id) || null;
  }

  async revokeById(id: string, revokedAt: Date): Promise<void> {
    this.tokens = this.tokens.map(token =>
      token.id === id ? new RefreshToken({ ...token, revokedAt }) : token,
    );
  }

  async revokeAllByUserId(userId: string, revokedAt: Date): Promise<void> {
    this.tokens = this.tokens.map(token =>
      token.userId === userId ? new RefreshToken({ ...token, revokedAt }) : token,
    );
  }
}
