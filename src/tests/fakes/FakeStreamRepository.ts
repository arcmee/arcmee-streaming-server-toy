import { Stream } from "@src/domain/entities/stream.entity";
import { IStreamRepository } from "@src/domain/repositories/IStreamRepository";

export class FakeStreamRepository implements IStreamRepository {
  private streams: Stream[] = [];

  async findById(id: string): Promise<Stream | null> {
    return this.streams.find(stream => stream.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Stream | null> {
    return this.streams.find(stream => stream.userId === userId) || null;
  }

  async findAllLive(): Promise<Stream[]> {
    return this.streams.filter(stream => stream.isLive);
  }

  async create(stream: Stream): Promise<Stream> {
    this.streams.push(stream);
    return stream;
  }

  async update(stream: Stream): Promise<Stream> {
    const streamIndex = this.streams.findIndex(s => s.id === stream.id);
    if (streamIndex > -1) {
      this.streams[streamIndex] = stream;
    }
    return stream;
  }
}
