import { IStreamRepository } from '../../../../domain/repositories/IStreamRepository';
import { Stream } from '../../../../domain/entities/stream.entity';
import { prisma } from '../client';

export class PostgresStreamRepository implements IStreamRepository {
  async findByUserId(userId: string): Promise<Stream | null> {
    const stream = await prisma.stream.findUnique({
      where: { userId },
    });
    return stream ? new Stream(stream) : null;
  }

  async findAllLive(): Promise<Stream[]> {
    const liveStreams = await prisma.stream.findMany({
      where: { isLive: true },
      include: { user: true }, // Include user data to show who is streaming
    });
    return liveStreams.map(s => new Stream({ ...s, user: new User(s.user) }));
  }

  async create(stream: Stream): Promise<Stream> {
    const newStream = await prisma.stream.create({
      data: {
        id: stream.id,
        title: stream.title,
        description: stream.description,
        isLive: stream.isLive,
        userId: stream.userId,
        thumbnailUrl: stream.thumbnailUrl,
      },
    });
    return new Stream(newStream);
  }

  async update(stream: Stream): Promise<Stream> {
    const updatedStream = await prisma.stream.update({
      where: { id: stream.id },
      data: {
        title: stream.title,
        description: stream.description,
        isLive: stream.isLive,
        thumbnailUrl: stream.thumbnailUrl,
      },
    });
    return new Stream(updatedStream);
  }
}