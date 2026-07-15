import { EnvironmentVector } from "./EnvironmentVector";

export enum OptimizationStrategy {
  NO_ACTION = "NO_ACTION",
  SCALE_UP = "SCALE_UP",
  SCALE_DOWN = "SCALE_DOWN",
  REBALANCE_LAYERS = "REBALANCE_LAYERS",
  REWIRE_GRAPH = "REWIRE_GRAPH",
  OPTIMIZE_PATHS = "OPTIMIZE_PATHS",
  ISOLATE_MODULES = "ISOLATE_MODULES",
  MERGE_COMPONENTS = "MERGE_COMPONENTS",
  CACHE_OPTIMIZATION = "CACHE_OPTIMIZATION",
  PRIORITY_REBALANCE = "PRIORITY_REBALANCE",
  RESOURCE_REALLOCATION = "RESOURCE_REALLOCATION"
}

export interface IOptimizationStrategyProvider {
  supports(vector: EnvironmentVector): boolean;
  evaluate(vector: EnvironmentVector): OptimizationStrategy[];
}
