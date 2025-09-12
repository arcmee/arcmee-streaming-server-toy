import { IStreamRepository } from '../../../../domain/repositories/IStreamRepository';
import { Stream } from '../../../../domain/entities/stream.entity';

export class PostgresStreamRepository implements IStreamRepository {
  private streams: Stream[] = [];

  async findByUserId(userId: string): Promise<Stream | null> {
    console.log(`Searching for stream with userId: ${userId} in PostgreSQL...`);
    const stream = this.streams.find(s => s.userId === userId);
    return stream || null;
  }

  async create(stream: Stream): Promise<Stream> {
    console.log(`Creating stream for userId: ${stream.userId} in PostgreSQL...`);
    this.streams.push(stream);
    return stream;
  }

  async update(stream: Stream): Promise<Stream> {
    console.log(`Updating stream for userId: ${stream.userId} in PostgreSQL...`);
    const index = this.streams.findIndex(s => s.id === stream.id);
    if (index !== -1) {
      this.streams[index] = stream;
      return stream;
    }
    // Or throw an error if stream not found
    return stream;
  }
}
