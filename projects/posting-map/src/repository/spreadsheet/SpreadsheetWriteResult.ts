export class SpreadsheetWriteResult {
  public readonly success: boolean;
  public readonly operationId: string;
  public readonly requestId: string;
  public readonly correlationId: string;
  public readonly processedAt: Date;
  public readonly errorType?: string; // e.g. CONCURRENCY_ERROR
  public readonly message?: string;
  public readonly isIdempotentSkip?: boolean;

  constructor(params: {
    success: boolean;
    operationId: string;
    requestId: string;
    correlationId: string;
    processedAt: Date;
    errorType?: string;
    message?: string;
    isIdempotentSkip?: boolean;
  }) {
    this.success = params.success;
    this.operationId = params.operationId;
    this.requestId = params.requestId;
    this.correlationId = params.correlationId;
    this.processedAt = params.processedAt;
    this.errorType = params.errorType;
    this.message = params.message;
    this.isIdempotentSkip = params.isIdempotentSkip;

    Object.freeze(this);
  }
}
