import { PredictionContext } from "./PredictionContext";

export interface ContextAggregator {
  aggregate(context: PredictionContext): Promise<any[]>;
}
