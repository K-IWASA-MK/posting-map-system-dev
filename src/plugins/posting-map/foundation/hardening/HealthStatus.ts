export interface HealthStatus {
  readonly status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  readonly checks: Record<string, { status: 'OK' | 'WARN' | 'FAIL'; message?: string }>;
  readonly timestamp: number;
  readonly version: string;
}
