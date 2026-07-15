/**
 * SchedulerMetrics holds queue state counters distinct from global system execution monitoring.
 */
export interface SchedulerMetrics {
  readonly queueLength: number;
  readonly activeDispatches: number;
  readonly totalQueued: number;
  readonly totalDispatched: number;
}
