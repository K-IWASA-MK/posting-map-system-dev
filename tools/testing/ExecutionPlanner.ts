import { TestAsset } from './TestAsset';
import { ExecutionPlan, ExecutionPlanEntry } from './ExecutionPlan';
import { ExecutionDependencyGraph } from './ExecutionDependencyGraph';
import { GraphScheduler } from './GraphScheduler';

export interface PlanOptions {
  tags?: string[];
  category?: string;
  capabilities?: string[];
  enabledOnly?: boolean;
}

export class ExecutionPlanner {
  /**
   * Generates a filtered, topologically scheduled, and strategy-resolved ExecutionPlan.
   */
  public static plan(assets: TestAsset[], options: PlanOptions = {}): ExecutionPlan {
    const enabledOnly = options.enabledOnly !== false;

    // 1. Build the complete dependency graph and topologically sort it
    const graph = new ExecutionDependencyGraph(assets);
    const sortedAssets = GraphScheduler.schedule(graph);

    const entries: ExecutionPlanEntry[] = [];

    for (const asset of sortedAssets) {
      // 2. Filter: Enabled check
      if (enabledOnly && !asset.enabled) {
        continue;
      }

      // 3. Filter: Category check (case-insensitive)
      if (options.category && asset.category.toLowerCase() !== options.category.toLowerCase()) {
        continue;
      }

      // 4. Filter: Tags check (case-insensitive, match any)
      if (options.tags && options.tags.length > 0) {
        const assetTagsLower = asset.tags.map(t => t.toLowerCase());
        const filterTagsLower = options.tags.map(t => t.toLowerCase());
        const hasMatchingTag = filterTagsLower.some(ft => assetTagsLower.includes(ft));
        if (!hasMatchingTag) {
          continue;
        }
      }

      // 5. Filter: Capabilities check (case-insensitive, match any)
      if (options.capabilities && options.capabilities.length > 0) {
        const assetCapsLower = asset.capabilities.map(c => c.toLowerCase());
        const filterCapsLower = options.capabilities.map(c => c.toLowerCase());
        const hasMatchingCap = filterCapsLower.some(fc => assetCapsLower.includes(fc));
        if (!hasMatchingCap) {
          continue;
        }
      }

      // 6. Strategy Resolution
      const requiresFresh = asset.capabilities.some(c => c.toLowerCase() === 'requiresfreshprocess');
      const strategyName = (requiresFresh || asset.isLegacy) ? 'Sequential' : 'Batch';

      // 7. Priority Resolution
      const priority = asset.priority ?? (asset.isLegacy ? 100 : 50);

      entries.push({
        asset,
        strategyName,
        timeout: asset.timeout,
        priority
      });
    }

    return { entries };
  }
}
