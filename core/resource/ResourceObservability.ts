export interface TokenUsageTimelineObserver {
  getTimeline(): any[];
}

export interface CostAccumulationObserver {
  getAccumulation(): any[];
}

export interface ActiveQueueDistributionObserver {
  getDistribution(): any;
}

export interface ResourceObservability {
  readonly tokenTimeline: TokenUsageTimelineObserver;
  readonly costAccumulation: CostAccumulationObserver;
  readonly queueDistribution: ActiveQueueDistributionObserver;
}
