import { RepositoryProviderType } from './RepositoryProviderType';

export class RepositoryExecutionResult {
  public readonly success: boolean;
  public readonly repositoryProvider: RepositoryProviderType;
  public readonly operationId: string;
  public readonly processedAt: Date;
  public readonly message?: string;
  public readonly requestId: string;
  public readonly correlationId: string;
  
  // Detailed execution metrics and context
  public readonly durationMs?: number;
  public readonly retryCount?: number;
  public readonly idempotencyApplied?: boolean;
  public readonly errorType?: string;

  constructor(params: {
    success: boolean;
    repositoryProvider: RepositoryProviderType;
    operationId: string;
    processedAt: Date;
    message?: string;
    requestId: string;
    correlationId: string;
    durationMs?: number;
    retryCount?: number;
    idempotencyApplied?: boolean;
    errorType?: string;
  }) {
    this.success = params.success;
    this.repositoryProvider = params.repositoryProvider;
    this.operationId = params.operationId;
    this.processedAt = params.processedAt;
    this.message = params.message;
    this.requestId = params.requestId;
    this.correlationId = params.correlationId;
    this.durationMs = params.durationMs;
    this.retryCount = params.retryCount;
    this.idempotencyApplied = params.idempotencyApplied;
    this.errorType = params.errorType;

    Object.freeze(this);
  }
}
