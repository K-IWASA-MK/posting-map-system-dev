export enum RuntimeHealthStatus {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  DEGRADED = 'DEGRADED',
  FAILED = 'FAILED',
  UNHEALTHY = 'UNHEALTHY'
}

export interface RuntimeHealth {
  status: RuntimeHealthStatus;
  lastCheckedAt: string;
  reason?: string;
  details?: Record<string, unknown>;

  // Phase 4 compatibility aliases
  lastChecked?: string;
  message?: string;
}
