export interface PromotionPolicy {
  minQualityScore: number;
  minConfidence: number;
  requiredCapabilities: string[];
  autoRejectOnConflict: boolean;
}
