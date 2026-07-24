import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface RawDataSnapshot {
  fileBasename: string;
  absolutePath: string;
  sizeBytes: number;
  sha256: string;
}

export class RawDataPreserver {
  private sources: Map<string, RawDataSnapshot> = new Map();

  public registerAndPreserve(filePath: string): RawDataSnapshot {
    if (!fs.existsSync(filePath)) {
      throw new Error(`[RawDataPreserver] Target raw data file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath);
    const sha256 = crypto.createHash('sha256').update(content).digest('hex');
    const stat = fs.statSync(filePath);
    const basename = path.basename(filePath);

    const snapshot: RawDataSnapshot = {
      fileBasename: basename,
      absolutePath: path.resolve(filePath),
      sizeBytes: stat.size,
      sha256
    };

    this.sources.set(basename, snapshot);
    return snapshot;
  }

  public getCombinedInputHash(): string {
    const sortedHashes = Array.from(this.sources.values())
      .map(s => s.sha256)
      .sort();
    return crypto.createHash('sha256').update(sortedHashes.join(':')).digest('hex');
  }

  public getSnapshot(fileBasename: string): RawDataSnapshot | undefined {
    return this.sources.get(fileBasename);
  }

  public getAllSnapshots(): RawDataSnapshot[] {
    return Array.from(this.sources.values());
  }
}
