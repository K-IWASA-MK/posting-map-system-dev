import { MonitorStatus } from './MonitorStatus';

export interface MonitorSnapshot {
  readonly snapshotId: string;
  readonly snapshotVersion: number;
  readonly generatedAt: string;
  readonly health: {
    readonly status: MonitorStatus;
    readonly reason?: string; // Reserved for error tracking
  };
  readonly sessions: {
    readonly active: number;
    readonly completed: number;
    readonly failed: number;
  };
  readonly metrics: {
    readonly averageExecutionTime: number;
    readonly executionCount: number;
    readonly averageReviewConfidence: number;
    readonly pluginExecutionCount: number;
  };
  readonly schemaVersion: string;
}
