import { PolicyProfile } from "./PolicyProfile";

export interface PolicyRecommendation {
  readonly recommendedProfile: PolicyProfile;
  readonly confidence: number;
  readonly reason: string;
  readonly risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly estimatedBenefit: number;
}
