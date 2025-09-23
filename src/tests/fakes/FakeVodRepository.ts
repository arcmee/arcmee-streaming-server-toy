import { Vod } from '@src/domain/entities/vod.entity';
import { IVodRepository } from '@src/domain/repositories/IVodRepository';

export class FakeVodRepository implements IVodRepository {
  private vods: Vod[] = [];

  async create(vod: Vod): Promise<Vod> {
    const newVod = { ...vod, id: `vod-${this.vods.length + 1}` };
    this.vods.push(newVod);
    return newVod;
  }

  async findById(id: string): Promise<Vod | null> {
    return this.vods.find(v => v.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Vod[]> {
    return this.vods.filter(v => v.userId === userId);
  }

  async save(vod: Vod): Promise<void> {
    const index = this.vods.findIndex(v => v.id === vod.id);
    if (index !== -1) {
      this.vods[index] = vod;
    }
  }

  // Helper for tests
  clearVods() {
    this.vods = [];
  }
}
