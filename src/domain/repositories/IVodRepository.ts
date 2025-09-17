import { Vod } from '../entities/vod.entity';

export interface IVodRepository {
  create(vod: Vod): Promise<Vod>;
  findById(id: string): Promise<Vod | null>;
  findByUserId(userId: string): Promise<Vod[]>;
  save(vod: Vod): Promise<void>;
}
