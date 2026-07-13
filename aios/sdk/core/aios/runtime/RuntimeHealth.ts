export enum RuntimeHealthStatus {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  DEGRADED = 'DEGRADED',
  FAILED = 'FAILED'
}

export interface RuntimeHealth {
  status: RuntimeHealthStatus;
  lastCheckedAt: string;
  reason?: string;
  details?: Record<string, unknown>;
}
