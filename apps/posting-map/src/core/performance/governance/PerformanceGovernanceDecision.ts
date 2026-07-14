export type PerformanceGovernanceStatus = 'PASS' | 'WARNING' | 'FAILED';

export enum PerformanceGovernanceAction {
  PROCEED = 'PROCEED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  BLOCK = 'BLOCK'
}

export interface PerformanceGovernanceDecision {
  status: PerformanceGovernanceStatus;
  score: number;
  action: PerformanceGovernanceAction;
  recommendation: string;
  generatedAt: string;
}
