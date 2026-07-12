import * as crypto from 'crypto';

export enum ExecutionSessionStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ExecutionSession {
  readonly sessionId: string;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly status: ExecutionSessionStatus;
  readonly retryCount: number;
  readonly cancellationToken?: any; // To be implemented later (e.g. AbortSignal)
}

export class ExecutionSessionBuilder {
  private sessionId: string = crypto.randomUUID();
  private startedAt: string = new Date().toISOString();
  private status: ExecutionSessionStatus = ExecutionSessionStatus.CREATED;
  private retryCount: number = 0;

  public build(): ExecutionSession {
    return Object.freeze({
      sessionId: this.sessionId,
      startedAt: this.startedAt,
      status: this.status,
      retryCount: this.retryCount,
    });
  }
}
