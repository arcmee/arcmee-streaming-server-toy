import { PrismaClient } from '@prisma/client';
import { IVodRepository } from '../../../../domain/repositories/IVodRepository';
import { Vod } from '../../../../domain/entities/vod.entity';

// This is a simplified mapping. In a real-world scenario, you might use a library like class-transformer.
const toEntity = (dbVod: any): Vod => {
  return new Vod({
    id: dbVod.id,
    streamId: dbVod.streamId,
    userId: dbVod.userId,
    title: dbVod.title,
    thumbnailUrl: dbVod.thumbnailUrl,
    videoUrl: dbVod.videoUrl,
    duration: dbVod.duration,
    createdAt: dbVod.createdAt,
    views: dbVod.views,
  });
};

export class PostgresVodRepository implements IVodRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(vod: Vod): Promise<Vod> {
    const createdDbVod = await this.prisma.vod.create({
      data: {
        id: vod.id,
        title: vod.title,
        thumbnailUrl: vod.thumbnailUrl,
        videoUrl: vod.videoUrl,
        duration: vod.duration,
        streamId: vod.streamId,
        userId: vod.userId,
      },
    });
    return toEntity(createdDbVod);
  }

  async findById(id: string): Promise<Vod | null> {
    const dbVod = await this.prisma.vod.findUnique({ where: { id } });
    return dbVod ? toEntity(dbVod) : null;
  }

  async findByUserId(userId: string): Promise<Vod[]> {
    const dbVods = await this.prisma.vod.findMany({ where: { userId } });
    return dbVods.map(toEntity);
  }

  async save(vod: Vod): Promise<void> {
    await this.prisma.vod.update({
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
}
