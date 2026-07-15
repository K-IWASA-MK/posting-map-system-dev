import { PredictionModel } from "./PredictionModel";
import { PredictionContext } from "./PredictionContext";
import { PredictionResult } from "./PredictionResult";
import { PredictionTarget } from "./PredictionTarget";

export class RoutingPredictionModel implements PredictionModel {
  readonly target = PredictionTarget.ROUTING_BOTTLENECK;
  async predict(context: PredictionContext, historyData: any[]): Promise<PredictionResult | null> {
    return null;
  }
}
