import * as fs from 'fs';
import * as path from 'path';

export interface CachedCoordinate {
  lat: number;
  lng: number;
  source: string;
  updated: string;
}

export class CoordinateCache {
  private cacheFilePath: string;
  private cache: Record<string, CachedCoordinate>;

  constructor(filePath?: string) {
    // Default to the data directory or wherever makes sense, e.g., root directory
    this.cacheFilePath = filePath || path.join(process.cwd(), 'coordinate_cache.json');
    this.cache = this.loadCache();
  }

  private loadCache(): Record<string, CachedCoordinate> {
    if (fs.existsSync(this.cacheFilePath)) {
      try {
        const rawData = fs.readFileSync(this.cacheFilePath, 'utf8');
        return JSON.parse(rawData);
      } catch (err) {
        console.error(`[CoordinateCache] Failed to load cache from ${this.cacheFilePath}:`, err);
        return {};
      }
    }
    return {};
  }

  public get(address: string): CachedCoordinate | null {
    return this.cache[address] || null;
  }

  public set(address: string, coordinate: Omit<CachedCoordinate, 'updated'>): void {
    this.cache[address] = {
      ...coordinate,
      updated: new Date().toISOString().split('T')[0], // format: YYYY-MM-DD
    };
    this.saveCache();
  }

  private saveCache(): void {
    try {
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.cache, null, 2), 'utf8');
    } catch (err) {
      console.error(`[CoordinateCache] Failed to save cache to ${this.cacheFilePath}:`, err);
    }
  }
}
