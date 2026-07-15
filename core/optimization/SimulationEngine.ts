import { OptimizationStrategy } from "./OptimizationStrategy";
import { EnvironmentVector } from "./EnvironmentVector";
import { SimulationResult } from "./SimulationResult";

export interface SimulationEngine {
  simulate(strategy: OptimizationStrategy, vector: EnvironmentVector): Promise<SimulationResult>;
}
