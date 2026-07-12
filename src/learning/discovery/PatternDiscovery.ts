import { LearningDataset } from '../contracts/LearningDataset';
import { PatternRegistry } from './PatternRegistry';
import { PatternDiscoveryResult, DiscoveredPatternItem } from './PatternDiscoveryResult';

/**
 * Facade for the Learning Engine.
 * Encapsulates the Registry and Plugin complexity so the Engine
 * only needs to call discoverAll() with a Dataset.
 */
export class PatternDiscovery {
  constructor(private readonly registry: PatternRegistry) {}

  public discoverAll(dataset: LearningDataset): PatternDiscoveryResult {
    const startTime = Date.now();
    const results: DiscoveredPatternItem[] = [];
    
    let pluginCount = 0;
    let skippedPlugins = 0;

    const enabledPlugins = this.registry.getAllEnabledPlugins();
    
    for (const plugin of enabledPlugins) {
      pluginCount++;
      if (plugin.extractor.supports(dataset)) {
        const extracted = plugin.extractor.extract(dataset);
        for (const item of extracted) {
          results.push({
            type: plugin.targetPatternType,
            data: item.data,
            stats: item.stats
          });
        }
      } else {
        skippedPlugins++;
      }
    }

    return Object.freeze({
      patterns: Object.freeze(results),
      pluginCount,
      skippedPlugins,
      durationMs: Date.now() - startTime
    });
  }
}
