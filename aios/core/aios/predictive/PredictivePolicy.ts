export interface PredictivePolicy {
  readonly minConfidenceThreshold: number;
  readonly maxPredictionWindowMs: number;
  readonly requiredDataQuality: number;
  readonly minSampleSize: number;
}
