import { ThresholdPolicy } from "./ThresholdPolicy";
import { StrategyPolicy } from "./StrategyPolicy";
import { SimulationPolicy } from "./SimulationPolicy";
import { SafetyPolicy } from "./SafetyPolicy";

export interface AdaptiveOptimizationPolicy {
  readonly threshold: ThresholdPolicy;
  readonly strategy: StrategyPolicy;
  readonly simulation: SimulationPolicy;
  readonly safety: SafetyPolicy;
}
