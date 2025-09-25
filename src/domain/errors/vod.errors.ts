export class VodNotFoundError extends Error {
  constructor() {
    super('VOD not found.');
    this.name = 'VodNotFoundError';
  }
}
