import { RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { RuntimeState } from '../runtime/RuntimeState';

export interface ObservabilityRecord {
  readonly recordId: string;
  readonly timestamp: string;
  readonly runtimeId: string;
  readonly executionId?: string;
  readonly sessionId?: string;
  readonly source: string;
  readonly category: string;
  readonly severity: string;
}

// 4. Metrics
export interface MetricsRecord extends ObservabilityRecord {
  readonly metrics: {
    readonly runtimeCount: number;
    readonly runtimeStates: Record<string, RuntimeState>;
    readonly runtimeHealths: Record<string, RuntimeHealthStatus>;
    readonly eventThroughput: number;
    readonly eventQueue: number;
    readonly validationCount: number;
    readonly pluginCount: number;
    readonly errorCount: number;
    readonly warningCount: number;
  };
}

// 5. Health Model
export enum PlatformHealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  UNKNOWN = 'UNKNOWN'
}

export interface HealthRecord extends ObservabilityRecord {
  readonly platformHealth: PlatformHealthStatus;
  readonly runtimeHealths: Record<string, RuntimeHealthStatus>;
}

// 6. Trace Model
export interface TraceRecord extends ObservabilityRecord {
  readonly traceId: string;
  readonly ledgerId?: string;
  readonly duration: number;
  readonly status: 'success' | 'failed' | 'running';
}

// 7. Alert Model
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface AlertRule {
  readonly ruleId: string;
  readonly condition: (record: any) => boolean;
  readonly severity: AlertSeverity;
  readonly action?: string;
  readonly cooldown: number; // in milliseconds
  readonly enabled: boolean;
}

export interface AlertRecord extends ObservabilityRecord {
  readonly alertId: string;
  readonly ruleId: string;
  readonly message: string;
}

// Log Record
export interface LogRecord extends ObservabilityRecord {
  readonly message: string;
}
