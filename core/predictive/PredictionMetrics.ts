export interface PredictionMetrics {
  recordAccuracy(score: number): void;
  recordLatency(timeMs: number): void;
  recordRejection(): void;
  recordModelUsage(modelName: string): void;
  getMetrics(): {
    predictionAccuracy: number;
    averageConfidence: number;
    predictionLatency: number;
    rejectedPredictionRate: number;
    modelUsageDistribution: Record<string, number>;
  };
}
