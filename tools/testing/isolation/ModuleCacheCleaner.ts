import * as path from 'path';

/**
 * ModuleCacheCleaner manages Node.js require cache keys to ensure fresh imports.
 */
export class ModuleCacheCleaner {
  /**
   * Returns a snapshot of all current require cache keys.
   */
  public static getCacheSnapshot(): Set<string> {
    return new Set(Object.keys(require.cache));
  }

  /**
   * Deletes a specific module file from require cache.
   */
  public static clearFile(filePath: string): boolean {
    const resolved = path.resolve(filePath);
    if (require.cache[resolved]) {
      delete require.cache[resolved];
      return true;
    }
    return false;
  }

  /**
   * Compares the current cache with a prior snapshot and deletes any newly added modules.
   * @param snapshot Prior require cache snapshot.
   * @returns Count of require cache modules pruned.
   */
  public static pruneNewModules(snapshot: Set<string>): number {
    let count = 0;
    const currentKeys = Object.keys(require.cache);
    
    for (const key of currentKeys) {
      if (!snapshot.has(key)) {
        // Only prune modules from our workspace projects, shared, sdk, and tests directories
        // to avoid pruning standard library or node_modules unless necessary.
        if (key.includes('/sdk/') || key.includes('/projects/') || key.includes('/tests/') || key.includes('/core/')) {
          delete require.cache[key];
          count++;
        }
      }
    }
    return count;
  }
}
