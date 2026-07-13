import { PerformanceGovernanceStatus, PerformanceGovernanceAction } from './PerformanceGovernanceDecision';
import { PerformancePolicyResult } from '../policy/PerformancePolicyResult';

export interface PerformanceGovernanceReport {
  overallStatus: PerformanceGovernanceStatus;
  action: PerformanceGovernanceAction;
  score: number;
  recommendation: string;
  violations: PerformancePolicyResult[];
  generatedAt: string;
}
