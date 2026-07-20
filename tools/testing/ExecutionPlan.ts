import { TestAsset } from './TestAsset';

/**
 * ExecutionPlanEntry defines an individual test execution item planned by the planner.
 */
export interface ExecutionPlanEntry {
  readonly asset: TestAsset;
  readonly strategyName: 'Batch' | 'Sequential';
  readonly timeout: number;
  readonly priority: number; // Execution priority: lower numbers execute first
}

/**
 * ExecutionPlan holds the ordered sequence of planned test entries.
 */
export interface ExecutionPlan {
  readonly entries: ExecutionPlanEntry[];
}
