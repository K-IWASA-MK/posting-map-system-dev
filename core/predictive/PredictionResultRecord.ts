import { PredictionResult } from "./PredictionResult";

export interface PredictionResultRecord {
  readonly id: string;
  readonly traceId: string;
  readonly result: PredictionResult;
  readonly isAccepted: boolean;
  readonly reason: string;
  readonly executedAt: number;
}
