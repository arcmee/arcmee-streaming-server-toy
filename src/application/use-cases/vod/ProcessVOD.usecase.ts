import { Vod } from '@src/domain/entities/vod.entity';
import { IStreamRepository } from '@src/domain/repositories/IStreamRepository';
import { IVodRepository } from '@src/domain/repositories/IVodRepository';

import { createId } from '@paralleldrive/cuid2';

export interface IProcessVODDTO {
  streamId: string;
  // In a real scenario, you'd get the path to the recorded file
  // from the media server webhook payload.
  recordedFilePath: string; 
}

export class ProcessVODUseCase {
  constructor(
    private readonly vodRepository: IVodRepository,
    private readonly streamRepository: IStreamRepository
    // private readonly videoProcessor: IVideoProcessor, // Will be added later
    // private readonly storage: IStorage, // Will be added later
  ) {}

  async execute(data: IProcessVODDTO): Promise<Vod> {
    console.log(`[ProcessVODUseCase] Start processing VOD for stream: ${data.streamId}`);

    const stream = await this.streamRepository.findById(data.streamId);
    if (!stream) {
      // Or handle this more gracefully
      throw new Error(`Stream with id ${data.streamId} not found.`);
    }

    // In a real scenario, video processing would happen here using data.recordedFilePath.
    // For now, we'll just create the VOD record with mock URLs.

    const newVod = new Vod({
      id: createId(),
      streamId: data.streamId,
      userId: stream.userId,
      title: `VOD - ${stream.title} - ${new Date().toLocaleDateString()}`,
      thumbnailUrl: `/vods/${data.streamId}/thumbnail.jpg`, // Mock
      videoUrl: `/vods/${data.streamId}/master.m3u8`, // Mock
      duration: 0, // Should be extracted from video metadata later
      createdAt: new Date(),
      views: 0,
    });

    const vod = await this.vodRepository.create(newVod);

    console.log(`[ProcessVODUseCase] Finished processing. VOD created with ID: ${vod.id}`);
    
    return vod;
  }
}
