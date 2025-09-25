export class StreamNotFoundError extends Error {
  constructor(criteria: string) {
    super(`Stream not found with criteria: ${criteria}`);
    this.name = 'StreamNotFoundError';
  }
}
