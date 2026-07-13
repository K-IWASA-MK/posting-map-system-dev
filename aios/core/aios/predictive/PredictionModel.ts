import { PredictionContext } from "./PredictionContext";
import { PredictionResult } from "./PredictionResult";
import { PredictionTarget } from "./PredictionTarget";

export interface PredictionModel {
  readonly target: PredictionTarget;
  predict(context: PredictionContext, historyData: any[]): Promise<PredictionResult | null>;
}
