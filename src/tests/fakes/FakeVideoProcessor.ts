import { IVideoProcessor } from '@src/domain/repositories/IVideoProcessor';
import * as path from 'path';
import * as fs from 'fs/promises';

export class FakeVideoProcessor implements IVideoProcessor {
  async transcodeToHLS(
    inputPath: string,
    outputDir: string,
  ): Promise<{ masterPlaylistPath: string; duration: number }> {
    // Simulate creating HLS files
    const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
    await fs.writeFile(masterPlaylistPath, '#EXTM3U\n');
    return { masterPlaylistPath, duration: 123.45 };
  }

  async extractThumbnail(
    inputPath: string,
    outputDir: string,
    timestamp: string,
  ): Promise<string> {
    // Simulate creating a thumbnail file
    const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');
    await fs.writeFile(thumbnailPath, 'fake-thumbnail-data');
    return thumbnailPath;
  }
}
