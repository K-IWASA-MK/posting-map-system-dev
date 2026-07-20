import { TestAsset } from './TestAsset';
import { ExecutionPlan, ExecutionPlanEntry } from './ExecutionPlan';

export interface PlanOptions {
  tags?: string[];
  category?: string;
  capabilities?: string[];
  enabledOnly?: boolean;
}

export class ExecutionPlanner {
  /**
   * Generates a filtered, prioritized, and strategy-resolved ExecutionPlan from a list of test assets.
   */
  public static plan(assets: TestAsset[], options: PlanOptions = {}): ExecutionPlan {
    const enabledOnly = options.enabledOnly !== false;
    const entries: ExecutionPlanEntry[] = [];

    for (const asset of assets) {
      // 1. Filter: Enabled check
      if (enabledOnly && !asset.enabled) {
        continue;
      }

      // 2. Filter: Category check (case-insensitive)
      if (options.category && asset.category.toLowerCase() !== options.category.toLowerCase()) {
        continue;
      }

      // 3. Filter: Tags check (case-insensitive, match any)
      if (options.tags && options.tags.length > 0) {
        const assetTagsLower = asset.tags.map(t => t.toLowerCase());
        const filterTagsLower = options.tags.map(t => t.toLowerCase());
        const hasMatchingTag = filterTagsLower.some(ft => assetTagsLower.includes(ft));
        if (!hasMatchingTag) {
          continue;
        }
      }

      // 4. Filter: Capabilities check (case-insensitive, match any)
      if (options.capabilities && options.capabilities.length > 0) {
        const assetCapsLower = asset.capabilities.map(c => c.toLowerCase());
        const filterCapsLower = options.capabilities.map(c => c.toLowerCase());
        const hasMatchingCap = filterCapsLower.some(fc => assetCapsLower.includes(fc));
        if (!hasMatchingCap) {
          continue;
        }
      }

      // 5. Strategy Resolution
      // If requiresFreshProcess is requested or if it is a Legacy test, force Sequential strategy.
      const requiresFresh = asset.capabilities.some(c => c.toLowerCase() === 'requiresfreshprocess');
      const strategyName = (requiresFresh || asset.isLegacy) ? 'Sequential' : 'Batch';

      // 6. Priority Resolution
      // Standard (batch) tests execute first (priority 50), Legacy (sequential) execute later (priority 100)
      const priority = asset.isLegacy ? 100 : 50;

      entries.push({
        asset,
        strategyName,
        timeout: asset.timeout,
        priority
      });
    }

    // 7. Sort by Priority (ascending) and ID (alphabetical, for determinism)
    entries.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.asset.id.localeCompare(b.asset.id);
    });

    return { entries };
  }
}
