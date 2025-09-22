export interface IVideoProcessor {
  transcodeToHLS(inputPath: string, outputDir: string): Promise<{ masterPlaylistPath: string; duration: number }>;
  extractThumbnail(inputPath: string, outputPath: string, timestamp: string): Promise<string>;
}
