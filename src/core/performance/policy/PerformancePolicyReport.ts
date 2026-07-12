import { PerformancePolicyResult } from './PerformancePolicyResult';

export interface PerformancePolicyReport {
  policyCount: number;
  score: number;
  pass: number;
  warning: number;
  failed: number;
  info: number;
  violations: PerformancePolicyResult[];
}
