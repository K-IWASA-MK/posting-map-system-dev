export class EvolutionMetrics {
  private strategySuccessCount: Record<string, number> = {};
  private strategyTotalCount: Record<string, number> = {};
  
  private approvalLatencies: number[] = [];
  private simulationDurations: number[] = [];
  
  private totalConfidences: number = 0;
  private confidenceCount: number = 0;
  
  private totalQualityGain: number = 0;
  private qualityGainCount: number = 0;

  recordStrategyUsage(strategy: string, success: boolean): void {
    this.strategyTotalCount[strategy] = (this.strategyTotalCount[strategy] || 0) + 1;
    if (success) {
      this.strategySuccessCount[strategy] = (this.strategySuccessCount[strategy] || 0) + 1;
    }
  }

  recordApprovalLatency(ms: number): void {
    this.approvalLatencies.push(ms);
  }

  recordSimulationDuration(ms: number): void {
    this.simulationDurations.push(ms);
  }

  recordConfidence(conf: number): void {
    this.totalConfidences += conf;
    this.confidenceCount++;
  }

  recordEstimatedQualityGain(gain: number): void {
    this.totalQualityGain += gain;
    this.qualityGainCount++;
  }
}
