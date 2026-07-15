import { IOptimizationStrategyProvider, OptimizationStrategy } from "./OptimizationStrategy";
import { EnvironmentVector } from "./EnvironmentVector";

export class OptimizationRegistry {
  private providers: IOptimizationStrategyProvider[] = [];

  public register(provider: IOptimizationStrategyProvider): void {
    this.providers.push(provider);
  }

  public resolve(vector: EnvironmentVector): OptimizationStrategy[] {
    const strategies = new Set<OptimizationStrategy>();
    for (const provider of this.providers) {
      if (provider.supports(vector)) {
        const results = provider.evaluate(vector);
        results.forEach(s => strategies.add(s));
      }
    }
    return Array.from(strategies);
  }

  public list(): IOptimizationStrategyProvider[] {
    return [...this.providers];
  }
}
