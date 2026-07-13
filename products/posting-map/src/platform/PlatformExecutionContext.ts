import { PlatformStage } from './PlatformStage';

export class PlatformExecutionContext {
  public readonly requestId: string;
  public readonly startedAt: number;
  public readonly completedAt: number | null;
  public readonly status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  public readonly stage: PlatformStage;
  public readonly metadata: Record<string, any>;
  public readonly traceId: string | null;
  public readonly correlationId: string | null;
  public readonly executionVersion: string | null;

  constructor(params: {
    requestId: string;
    startedAt: number;
    completedAt?: number | null;
    status?: 'RUNNING' | 'COMPLETED' | 'FAILED';
    stage?: PlatformStage;
    metadata?: Record<string, any>;
    traceId?: string | null;
    correlationId?: string | null;
    executionVersion?: string | null;
  }) {
    this.requestId = params.requestId;
    this.startedAt = params.startedAt;
    this.completedAt = params.completedAt ?? null;
    this.status = params.status ?? 'RUNNING';
    this.stage = params.stage ?? PlatformStage.INITIALIZING;
    this.metadata = Object.freeze({ ...params.metadata });
    this.traceId = params.traceId ?? null;
    this.correlationId = params.correlationId ?? null;
    this.executionVersion = params.executionVersion ?? null;
  }

  public withStage(stage: PlatformStage, status?: 'RUNNING' | 'COMPLETED' | 'FAILED', completedAt?: number): PlatformExecutionContext {
    return new PlatformExecutionContext({
      requestId: this.requestId,
      startedAt: this.startedAt,
      completedAt: completedAt !== undefined ? completedAt : this.completedAt,
      status: status ?? this.status,
      stage: stage,
      metadata: this.metadata,
      traceId: this.traceId,
      correlationId: this.correlationId,
      executionVersion: this.executionVersion
    });
  }

  public withMetadata(metadata: Record<string, any>): PlatformExecutionContext {
    return new PlatformExecutionContext({
      requestId: this.requestId,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      status: this.status,
      stage: this.stage,
      metadata: { ...this.metadata, ...metadata },
      traceId: this.traceId,
      correlationId: this.correlationId,
      executionVersion: this.executionVersion
    });
  }

  public withAuditIdentifiers(identifiers: { traceId?: string | null; correlationId?: string | null; executionVersion?: string | null }): PlatformExecutionContext {
    return new PlatformExecutionContext({
      requestId: this.requestId,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      status: this.status,
      stage: this.stage,
      metadata: this.metadata,
      traceId: identifiers.traceId !== undefined ? identifiers.traceId : this.traceId,
      correlationId: identifiers.correlationId !== undefined ? identifiers.correlationId : this.correlationId,
      executionVersion: identifiers.executionVersion !== undefined ? identifiers.executionVersion : this.executionVersion
    });
  }
}
