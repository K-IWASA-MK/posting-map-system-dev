export interface OptimizationQueueObserver {
  getQueueLength(): number;
  getPendingItems(): any[];
}

export interface EnvironmentTimelineObserver {
  getTimelineEvents(): any[];
}

export interface StrategyTimelineObserver {
  getStrategyEvents(): any[];
}

export interface RuntimeHealthObserver {
  getHealthStatus(): string;
  getHealthScore(): number;
}

export interface ResourceGraphObserver {
  getGraphNodes(): any[];
  getGraphEdges(): any[];
}

export interface OptimizationObservability {
  readonly queue: OptimizationQueueObserver;
  readonly environment: EnvironmentTimelineObserver;
  readonly strategy: StrategyTimelineObserver;
  readonly health: RuntimeHealthObserver;
  readonly resources: ResourceGraphObserver;
}
