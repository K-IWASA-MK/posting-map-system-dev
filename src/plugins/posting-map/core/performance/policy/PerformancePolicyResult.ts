export type PolicyStatus = 'PASS' | 'WARNING' | 'FAILED' | 'INFO';

export interface PerformancePolicyResult {
  ruleId: string;
  ruleName: string;
  status: PolicyStatus;
  message: string;
  targetFile?: string;
}
