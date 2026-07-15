export interface RoutingMetrics {
  recordSelection(path: import("./RoutingPath").RoutingPath): void;
  recordTime(timeMs: number): void;
  getMetrics(): {
    routeSelectionRate: Record<string, number>;
    averageRoutingTime: number;
    fastTrackRate: number;
    manualReviewRate: number;
    blockRate: number;
    pathStability: number;
  };
}
