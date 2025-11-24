import { RefreshToken } from '../entities/refresh-token.entity';

export interface IRefreshTokenRepository {
  create(token: RefreshToken): Promise<RefreshToken>;
  findById(id: string): Promise<RefreshToken | null>;
  revokeById(id: string, revokedAt: Date): Promise<void>;
  revokeAllByUserId(userId: string, revokedAt: Date): Promise<void>;
}
