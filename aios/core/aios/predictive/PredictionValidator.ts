import { PredictionResult } from "./PredictionResult";
import { PredictivePolicy } from "./PredictivePolicy";
import { PredictionContext } from "./PredictionContext";

export class PredictionValidator {
  constructor(private policy: PredictivePolicy) {}

  public validate(result: PredictionResult, context: PredictionContext): boolean {
    if (context.dataQuality < this.policy.requiredDataQuality) {
      return false;
    }
    if (context.sampleSize < this.policy.minSampleSize) {
      return false;
    }
    if (result.confidence < this.policy.minConfidenceThreshold) {
      return false;
    }
    return true;
  }
}
