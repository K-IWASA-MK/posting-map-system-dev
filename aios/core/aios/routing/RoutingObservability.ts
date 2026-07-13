export interface RoutingQueueObserver {
  getQueueLength(): number;
}

export interface ActiveRoutesObserver {
  getActiveRoutesCount(): number;
}

export interface PathDistributionObserver {
  getDistribution(): Record<string, number>;
}

export interface PolicyDecisionsObserver {
  getRecentDecisions(): any[];
}

export interface RoutingTimelineObserver {
  getTimelineEvents(): any[];
}

export interface RoutingObservability {
  readonly queue: RoutingQueueObserver;
  readonly activeRoutes: ActiveRoutesObserver;
  readonly pathDistribution: PathDistributionObserver;
  readonly policyDecisions: PolicyDecisionsObserver;
  readonly timeline: RoutingTimelineObserver;
}
