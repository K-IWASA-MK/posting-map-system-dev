import { OptimizationStrategy } from "./OptimizationStrategy";
import { EnvironmentVector } from "./EnvironmentVector";
import { OptimizationRegistry } from "./OptimizationRegistry";

export class StrategySelector {
  constructor(private registry: OptimizationRegistry) {}

  public select(vector: EnvironmentVector): OptimizationStrategy {
    const strategies = this.registry.resolve(vector);
    if (strategies.length === 0) {
      return OptimizationStrategy.NO_ACTION;
    }
    // Select highest priority strategy, simplified for Foundation
    return strategies[0];
  }
}
