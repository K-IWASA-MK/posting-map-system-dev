import { OptimizationStrategy } from "./OptimizationStrategy";
import { SimulationResult } from "./SimulationResult";

export interface DecisionRecord {
  readonly id: string;
  readonly strategy: OptimizationStrategy;
  readonly simulationResult: SimulationResult;
  readonly executedAt: number;
  readonly status: "APPROVED" | "REJECTED" | "PENDING" | "FAILED";
  readonly reason: string;
}
