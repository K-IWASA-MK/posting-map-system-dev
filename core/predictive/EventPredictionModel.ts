import { PredictionModel } from "./PredictionModel";
import { PredictionContext } from "./PredictionContext";
import { PredictionResult } from "./PredictionResult";
import { PredictionTarget } from "./PredictionTarget";

export class EventPredictionModel implements PredictionModel {
  readonly target = PredictionTarget.EVENT_OCCURRENCE;
  async predict(context: PredictionContext, historyData: any[]): Promise<PredictionResult | null> {
    return null;
  }
}
