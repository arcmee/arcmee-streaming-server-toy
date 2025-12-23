export class StreamNotFoundError extends Error {
  constructor(criteria: string) {
    super(`Stream not found with criteria: ${criteria}`);
    this.name = 'StreamNotFoundError';
  }
}

export class LiveThumbnailError extends Error {
  constructor(message: string) {
    super(`Live thumbnail error: ${message}`);
    this.name = 'LiveThumbnailError';
  }
}
