import { IStorage } from '@src/domain/repositories/IStorage';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FakeStorage implements IStorage {
  public uploadedFiles: Map<string, string> = new Map();

  async uploadDirectory(
    directoryPath: string,
    destinationPath: string,
  ): Promise<string> {
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
      const localPath = path.join(directoryPath, file);
      const remotePath = `${destinationPath}/${file}`.replace(/\\/g, '/');
      const content = await fs.readFile(localPath, 'utf-8');
      this.uploadedFiles.set(remotePath, content);
    }
    return `https://fake-storage.com/${destinationPath}`;
  }

  getPublicUrl(path: string): string {
    return `https://fake-storage.com/${path}`.replace(/\\/g, '/');
  }

  // Helper for tests
  clear() {
    this.uploadedFiles.clear();
  }
}
