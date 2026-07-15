import { PredictionModel } from "./PredictionModel";
import { PredictionContext } from "./PredictionContext";
import { PredictionResult } from "./PredictionResult";
import { PredictionTarget } from "./PredictionTarget";

export class LoadPredictionModel implements PredictionModel {
  readonly target = PredictionTarget.LOAD_TREND;
  async predict(context: PredictionContext, historyData: any[]): Promise<PredictionResult | null> {
    return null; // Implemented by Mock or actual plugin
  }
}
