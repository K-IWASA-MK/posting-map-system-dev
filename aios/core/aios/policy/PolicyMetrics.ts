export interface PolicyMetrics {
  recordPolicySwitch(): void;
  recordEvaluationLatency(timeMs: number): void;
  recordConflictResolution(): void;
  recordValidationFailure(): void;
  getMetrics(): {
    policySwitchCount: number;
    evaluationLatencyMs: number;
    conflictResolutionCount: number;
    validationFailureCount: number;
  };
}
