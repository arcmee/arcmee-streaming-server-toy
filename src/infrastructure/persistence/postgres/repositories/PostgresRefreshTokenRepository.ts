import { PrismaClient, RefreshToken as PrismaRefreshToken } from '@prisma/client';
import { RefreshToken } from '@src/domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '@src/domain/repositories/IRefreshTokenRepository';

export class PostgresRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(token: PrismaRefreshToken): RefreshToken {
    return new RefreshToken({
      id: token.id,
      tokenHash: token.tokenHash,
      userId: token.userId,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      revokedAt: token.revokedAt,
    });
  }

  async create(token: RefreshToken): Promise<RefreshToken> {
    const created = await this.prisma.refreshToken.create({
      data: {
        id: token.id,
        tokenHash: token.tokenHash,
        userId: token.userId,
        expiresAt: token.expiresAt,
        createdAt: token.createdAt,
        revokedAt: token.revokedAt,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<RefreshToken | null> {
    const token = await this.prisma.refreshToken.findUnique({ where: { id } });
    return token ? this.toDomain(token) : null;
  }

  async revokeById(id: string, revokedAt: Date): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { id },
      data: { revokedAt },
    });
  }

  async revokeAllByUserId(userId: string, revokedAt: Date): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt },
    });
  }
}
