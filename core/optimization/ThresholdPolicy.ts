export interface ThresholdPolicy {
  readonly maxRuntimeLoad: number;
  readonly minQualityScore: number;
  readonly maxEntropy: number;
  readonly minTrustScore: number;
  
  isExceeded(vector: import("./EnvironmentVector").EnvironmentVector): boolean;
}
