import { Stream } from '../entities/stream.entity';

export interface IStreamRepository {
  findById(id: string): Promise<Stream | null>;
  findByUserId(userId: string): Promise<Stream | null>;
  findAllLive(): Promise<Stream[]>;
  create(stream: Stream): Promise<Stream>;
  update(stream: Stream): Promise<Stream>;
}
