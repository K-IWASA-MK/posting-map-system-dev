export interface HealingPlan {
  planId: string;
  targetLayer: string;
  detectedIssue: string;
  fixStrategy: string;
  dependencies: string[];
  riskLevel: string;
}
