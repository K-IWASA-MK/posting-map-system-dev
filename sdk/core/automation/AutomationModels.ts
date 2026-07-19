export interface AutomationDecision {
  readonly decisionId: string;
  readonly recommendationId: string;
  readonly policyResult: 'PASS' | 'FAIL';
  readonly approvalResult: 'APPROVED' | 'REJECTED';
  readonly reason: string;
  readonly timestamp: string;
}

export interface AutomationResult {
  readonly actionId: string;
  readonly runtimeId: string;
  readonly executionId: string;
  readonly status: 'success' | 'failed';
  readonly startedAt: string;
  readonly completedAt: string;
  readonly duration: number;
  readonly error?: string;
}

export interface SelfRegulationRecord {
  readonly observationId: string;
  readonly qualityEvaluationId: string;
  readonly recommendationId: string;
  readonly automationDecisionId: string;
  readonly automationResultId: string;
  readonly ledgerId: string;
}

export interface QueueItem {
  readonly actionName: string;
  readonly recommendationId: string;
  readonly priority: number; // Lower is higher priority (e.g. 1 = HIGH, 2 = MEDIUM, 3 = LOW)
  readonly scheduledAt: number;
  readonly expiresAt: number;
}
