import { PredictionModel } from "./PredictionModel";
import { PredictionContext } from "./PredictionContext";
import { PredictionResult } from "./PredictionResult";
import { PredictionTarget } from "./PredictionTarget";

export class ResourcePredictionModel implements PredictionModel {
  readonly target = PredictionTarget.RESOURCE_DEMAND;
  async predict(context: PredictionContext, historyData: any[]): Promise<PredictionResult | null> {
    return null;
  }
}
