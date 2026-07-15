export interface ActiveCoordinationStrategyObserver {
  getStrategy(): string;
}

export interface DecisionTimelineObserver {
  getTimeline(): any[];
}

export interface CoordinationObservability {
  readonly strategy: ActiveCoordinationStrategyObserver;
  readonly timeline: DecisionTimelineObserver;
}
