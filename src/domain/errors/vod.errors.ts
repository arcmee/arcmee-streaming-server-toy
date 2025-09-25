export class VodNotFoundError extends Error {
  constructor() {
    super('VOD not found.');
    this.name = 'VodNotFoundError';
  }
}

export class VideoProcessingError extends Error {
  constructor(message: string) {
    super(`Video processing failed: ${message}`);
    this.name = 'VideoProcessingError';
  }
}

export class StorageUploadError extends Error {
  constructor(message: string) {
    super(`Storage upload failed: ${message}`);
    this.name = 'StorageUploadError';
  }
}
