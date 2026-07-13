export interface OptimizationContext {
  optimizationId: string;
  runtimeId: string;
  graphSnapshotId: string;
  targetLayer: string;
  constraintSet: string[];
  timestamp: string;
}
