import { IOptimizationStrategyProvider, OptimizationStrategy } from "./OptimizationStrategy";
import { EnvironmentVector } from "./EnvironmentVector";

export class MockOptimizationProvider implements IOptimizationStrategyProvider {
  public supports(vector: EnvironmentVector): boolean {
    return true; // Mock supports everything
  }

  public evaluate(vector: EnvironmentVector): OptimizationStrategy[] {
    if (vector.runtimeLoad > 0.8) {
      return [OptimizationStrategy.SCALE_UP];
    }
    if (vector.systemEntropy > 0.9) {
      return [OptimizationStrategy.ISOLATE_MODULES]; // Triggering a potentially unsafe strategy
    }
    return [OptimizationStrategy.NO_ACTION];
  }
}
