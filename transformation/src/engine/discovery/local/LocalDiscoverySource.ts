import * as path from 'path';
import { IDiscoverySource } from '../interfaces';
import { PluginDiscoveryRequest, PluginCandidate } from '../models';
import { PluginOrigin } from '../../../models/plugin';
import { DirectoryScanner } from './DirectoryScanner';
import { ManifestReader } from './ManifestReader';

/**
 * LocalDiscoverySource
 * 
 * Discovers plugins from a local filesystem directory.
 */
export class LocalDiscoverySource implements IDiscoverySource {
  public readonly sourceName = 'LOCAL_FS';

  constructor(
    private readonly searchPaths: readonly string[],
    private readonly scanner: DirectoryScanner = new DirectoryScanner(),
    private readonly reader: ManifestReader = new ManifestReader()
  ) {}

  async discover(request: PluginDiscoveryRequest): Promise<readonly PluginCandidate[]> {
    const candidates: PluginCandidate[] = [];

    for (const searchPath of this.searchPaths) {
      const pluginDirs = await this.scanner.scan(searchPath);

      for (const dir of pluginDirs) {
        const manifestPath = path.join(dir, 'manifest.json');
        const manifest = await this.reader.read(manifestPath);

        if (manifest) {
          // Local plugin trust is implicitly high because it's locally installed,
          // but we assign a base value that can be overridden by the RankingEngine.
          candidates.push({
            manifest,
            location: dir,
            source: PluginOrigin.LOCAL,
            trust: 100, // Local filesystem is highly trusted
            priority: 0, // Default priority
            score: 0 // To be computed by RankingEngine
          });
        }
      }
    }

    return candidates;
  }
}
