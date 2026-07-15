export interface OptimizationPlan {
  planId: string;
  targetSystem: string;
  optimizationStrategy: string;
  affectedLayers: string[];
  expectedImpact: string;
  riskProfile: string;
}
