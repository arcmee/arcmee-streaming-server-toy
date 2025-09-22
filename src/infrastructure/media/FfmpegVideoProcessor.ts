import ffmpeg = require('fluent-ffmpeg');
import * as path from 'path';
import { IVideoProcessor } from '@src/domain/repositories/IVideoProcessor';

// Optional: If you have ffmpeg installed system-wide, you might not need this.
// If you package ffmpeg with your app, you would set the path here.
// import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';
// ffmpeg.setFfmpegPath(ffmpegPath.path);

export class FfmpegVideoProcessor implements IVideoProcessor {

  private getVideoDuration = (filePath: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err: Error, metadata) => {
        if (err) {
          return reject(err);
        }
        resolve(metadata.format.duration || 0);
      });
    });
  }

  async transcodeToHLS(inputPath: string, outputDir: string): Promise<{ masterPlaylistPath: string; duration: number }> {
    const masterPlaylistName = 'master.m3u8';
    const masterPlaylistPath = path.join(outputDir, masterPlaylistName);
    const duration = await this.getVideoDuration(inputPath);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          // `-hls_time 10`: Segment duration in seconds
          '-hls_time 10',
          // `-hls_list_size 0`: Keep all segments in the playlist
          '-hls_list_size 0',
          // `-hls_flags single_file`: Store all segments in a single .ts file (optional, but can be simpler)
          // Or use segment filename pattern for multiple files:
          '-hls_segment_filename',
          path.join(outputDir, 'segment%03d.ts'),
          // `-start_number 0`: Start segment numbering from 0
          '-start_number 0'
        ])
        .output(masterPlaylistPath)
        .on('end', () => resolve({ masterPlaylistPath, duration }))
        .on('error', (err: Error) => reject(err))
        .run();
    });
  }

  async extractThumbnail(inputPath: string, outputDir: string, timestamp: string): Promise<string> {
    const thumbnailName = 'thumbnail.jpg';
    const thumbnailPath = path.join(outputDir, thumbnailName);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: [timestamp],
          filename: thumbnailName,
          folder: outputDir,
          size: '640x360' // Example size
        })
        .on('end', () => resolve(thumbnailPath))
        .on('error', (err: Error) => reject(err));
    });
  }
}