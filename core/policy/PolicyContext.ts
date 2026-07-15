import { EnvironmentVector } from "../optimization/EnvironmentVector";
import { PredictionResult } from "../predictive/PredictionResult";

export interface PolicyContext {
  readonly traceId: string;
  readonly environmentVector: EnvironmentVector;
  readonly activePredictions: PredictionResult[];
  readonly currentActivePolicies: string[];
  readonly systemHealth: number;
}
