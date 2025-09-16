import { Stream } from '../entities/stream.entity';

export interface IStreamRepository {
  findByUserId(userId: string): Promise<Stream | null>;
  findAllLive(): Promise<Stream[]>;
  create(stream: Stream): Promise<Stream>;
  update(stream: Stream): Promise<Stream>;
}
