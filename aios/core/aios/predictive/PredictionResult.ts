import { PredictionTarget } from "./PredictionTarget";

export interface PredictionResult {
  readonly target: PredictionTarget;
  readonly predictedValue: any;
  readonly confidence: number;
  readonly risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly recommendation: string;
  readonly traceId: string;
}
