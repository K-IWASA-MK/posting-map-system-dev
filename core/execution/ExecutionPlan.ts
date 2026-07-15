import { ExecutionStep } from "./ExecutionStep";

export interface ExecutionPlan {
  readonly planId: string;
  readonly steps: ExecutionStep[];
  readonly totalTimeoutMs: number;
  readonly requiresCheckpoint: boolean;
  readonly rollbackSupported: boolean;
}
