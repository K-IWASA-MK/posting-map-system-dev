export enum DashboardFailurePolicy {
  FAIL_FAST = 'FAIL_FAST',
  RETRY = 'RETRY',
  IGNORE = 'IGNORE'
}

export interface DashboardPolicy {
  maxRetries: number;
  backoffMs: number;
  failurePolicy: DashboardFailurePolicy;
  eventRetentionCount: number;
  projectionUpdateIntervalMs: number;
}

export const DefaultDashboardPolicy: DashboardPolicy = {
  maxRetries: 3,
  backoffMs: 1000,
  failurePolicy: DashboardFailurePolicy.RETRY,
  eventRetentionCount: 1000, // keep last 1000 events
  projectionUpdateIntervalMs: 100 // debounce updates
};
