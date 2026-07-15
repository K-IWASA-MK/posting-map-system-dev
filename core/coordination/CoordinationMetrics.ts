export interface CoordinationMetrics {
  recordLatency(timeMs: number): void;
  recordConsensusFailure(): void;
  recordDelegationSuccess(): void;
  getMetrics(): {
    averageLatencyMs: number;
    consensusFailureRate: number;
    delegationSuccessCount: number;
  };
}
