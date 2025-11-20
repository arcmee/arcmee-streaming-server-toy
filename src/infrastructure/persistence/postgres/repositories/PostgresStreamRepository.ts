import { PrismaClient, Stream as PrismaStream } from '@prisma/client';
import { Stream } from '@src/domain/entities/stream.entity';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';

export class PostgresStreamRepository implements IStreamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(stream: PrismaStream): Stream {
    return new Stream({ ...stream });
  }

  async findById(id: string): Promise<Stream | null> {
    const stream = await this.prisma.stream.findUnique({
      where: { id },
    });
    return stream ? this.toDomain(stream) : null;
  }

  async findByUserId(userId: string): Promise<Stream | null> {
    const stream = await this.prisma.stream.findUnique({
      where: { userId },
    });
    return stream ? this.toDomain(stream) : null;
  }

  async findAllLive(): Promise<Stream[]> {
    const liveStreams = await this.prisma.stream.findMany({
      where: { isLive: true },
    });
    return liveStreams.map(stream => this.toDomain(stream));
  }

  async create(stream: Stream): Promise<Stream> {
    const { id, ...streamData } = stream;
    const newStream = await this.prisma.stream.create({
      data: {
        ...streamData,
        id: id,
        thumbnailUrl: stream.thumbnailUrl || null,
      },
    });
    return this.toDomain(newStream);
  }

  async update(stream: Stream): Promise<Stream> {
    const updatedStream = await this.prisma.stream.update({
      where: { id: stream.id },
      data: {
        title: stream.title,
        description: stream.description,
        isLive: stream.isLive,
        thumbnailUrl: stream.thumbnailUrl,
      },
    });
    return this.toDomain(updatedStream);
  }
}
