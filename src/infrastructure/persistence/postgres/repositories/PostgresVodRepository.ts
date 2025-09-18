import { PrismaClient, VOD as PrismaVOD } from '@prisma/client';
import { Vod } from '@src/domain/entities/vod.entity';
import { IVodRepository } from '@src/domain/repositories/IVodRepository';

export class PostgresVodRepository implements IVodRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(vod: Vod): Promise<Vod> {
    const { id, ...vodData } = vod;
    const newVod = await this.prisma.vOD.create({
      data: {
        ...vodData,
        id: id || undefined, // Prisma will use default if id is undefined
      },
    });
    return this.toDomain(newVod);
  }

  async findById(id: string): Promise<Vod | null> {
    const vod = await this.prisma.vOD.findUnique({ where: { id } });
    return vod ? this.toDomain(vod) : null;
  }

  async findByUserId(userId: string): Promise<Vod[]> {
    const vods = await this.prisma.vOD.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return vods.map(this.toDomain);
  }

  async save(vod: Vod): Promise<void> {
    await this.prisma.vOD.update({
      where: { id: vod.id },
      data: {
        title: vod.title,
        thumbnailUrl: vod.thumbnailUrl,
        videoUrl: vod.videoUrl,
        duration: vod.duration,
        views: vod.views,
      },
    });
  }

  private toDomain(vod: PrismaVOD): Vod {
    return new Vod({
      ...vod,
    });
  }
}
