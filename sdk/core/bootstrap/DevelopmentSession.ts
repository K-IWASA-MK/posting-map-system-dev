export enum DevelopmentSessionStatus {
  INITIALIZED = 'INITIALIZED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface DevelopmentSession {
  readonly sessionId: string;
  readonly requestId: string;
  readonly executionId: string;
  readonly contextId: string;
  readonly startTime: number;
  readonly status: DevelopmentSessionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
