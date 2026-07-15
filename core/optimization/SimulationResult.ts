import { OptimizationStrategy } from "./OptimizationStrategy";

export interface SimulationResult {
  readonly score: number;
  readonly risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly benefit: number;
  readonly recommendation: OptimizationStrategy;
  readonly traceId: string;
  readonly success: boolean;
}
