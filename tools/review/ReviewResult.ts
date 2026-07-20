export interface ReviewViolation {
  readonly ruleId: string;
  readonly severity: 'ERROR' | 'WARNING';
  readonly message: string;
  readonly targetFile?: string;
  readonly remediation?: string;
}

export interface ReviewResult {
  readonly status: 'PASS' | 'FAILED';
  readonly decision: 'PROCEED' | 'REJECT';
  readonly score: number; // Evaluated score between 0 and 100
  readonly violations: ReviewViolation[];
  readonly timestamp: string;
  readonly consensusTrace?: string[];
  readonly agentReviews?: any[];
}
