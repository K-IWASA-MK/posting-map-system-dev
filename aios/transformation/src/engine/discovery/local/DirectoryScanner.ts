import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * DirectoryScanner
 * 
 * Scans a target directory to find directories that might contain plugins.
 * Only returns directories (potential plugin roots).
 */
export class DirectoryScanner {
  
  /**
   * Scans the base directory and returns absolute paths to subdirectories.
   * Assumes each subdirectory might contain a plugin (1 level deep).
   */
  async scan(basePath: string): Promise<readonly string[]> {
    try {
      const entries = await fs.readdir(basePath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => path.join(basePath, entry.name));
    } catch (e) {
      // Return empty array if directory does not exist or cannot be read
      return [];
    }
  }
}
