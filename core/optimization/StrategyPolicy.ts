import { OptimizationStrategy } from "./OptimizationStrategy";

export interface StrategyPolicy {
  readonly allowedStrategies: OptimizationStrategy[];
  readonly blockedStrategies: OptimizationStrategy[];
  
  isAllowed(strategy: OptimizationStrategy): boolean;
}
