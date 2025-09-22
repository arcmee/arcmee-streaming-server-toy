import { IStorage } from "@src/domain/repositories/IStorage";
import * as path from 'path';
import * as fs from 'fs-extra'; // Using fs-extra for recursive copying

export class LocalStorage implements IStorage {
  constructor(
    private readonly publicDir: string, // e.g., path.join(__dirname, '..', 'public')
    private readonly baseUrl: string,   // e.g., 'http://localhost:3000/static'
  ) {
    // Ensure the public directory exists
    fs.ensureDirSync(this.publicDir);
  }

  async uploadDirectory(directoryPath: string, destinationPath: string): Promise<string> {
    const fullDestinationPath = path.join(this.publicDir, destinationPath);
    await fs.ensureDir(path.dirname(fullDestinationPath));
    await fs.copy(directoryPath, fullDestinationPath);
    return fullDestinationPath;
  }

  getPublicUrl(filePath: string): string {
    // Convert backslashes to forward slashes for URL
    const urlPath = filePath.replace(/\\/g, '/');
    return `${this.baseUrl}/${urlPath}`;
  }
}
