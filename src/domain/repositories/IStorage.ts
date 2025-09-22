export interface IStorage {
  uploadDirectory(directoryPath: string, destinationPath: string): Promise<string>;
  getPublicUrl(path: string): string;
}
