export interface PredictionQueueObserver {
  getQueueLength(): number;
}

export interface ConfidenceTimelineObserver {
  getTimeline(): any[];
}

export interface ForecastDistributionObserver {
  getDistribution(): Record<string, number>;
}

export interface ActivePredictionModelsObserver {
  getActiveModelsCount(): number;
}

export interface PredictionHealthObserver {
  getHealthScore(): number;
}

export interface PredictionObservability {
  readonly queue: PredictionQueueObserver;
  readonly confidenceTimeline: ConfidenceTimelineObserver;
  readonly forecastDistribution: ForecastDistributionObserver;
  readonly activeModels: ActivePredictionModelsObserver;
  readonly health: PredictionHealthObserver;
}
