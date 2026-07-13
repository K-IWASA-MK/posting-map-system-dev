import { OptimizationStrategy } from "./OptimizationStrategy";
import { EnvironmentVector } from "./EnvironmentVector";
import { AdaptiveOptimizationPolicy } from "./AdaptiveOptimizationPolicy";

export class OptimizationEvaluator {
  constructor(private policy: AdaptiveOptimizationPolicy) {}

  public evaluate(strategy: OptimizationStrategy, vector: EnvironmentVector): boolean {
    if (!this.policy.strategy.isAllowed(strategy)) {
      return false;
    }
    if (this.policy.threshold.isExceeded(vector)) {
      // In a real implementation, threshold exceeded might force an optimization or block it depending on context
      return false; // Assuming safety failure for simple mock
    }
    return true;
  }
}
