import { RepositoryUpdateRequest } from '../../application/task-result';

export class RepositoryExecutionContext {
  public readonly requestId: string;
  public readonly correlationId: string;
  public readonly executionId: string;
  public readonly receivedAt: Date;
  public readonly request: RepositoryUpdateRequest;

  constructor(params: {
    requestId: string;
    correlationId: string;
    executionId: string;
    receivedAt: Date;
    request: RepositoryUpdateRequest;
  }) {
    this.requestId = params.requestId;
    this.correlationId = params.correlationId;
    this.executionId = params.executionId;
    this.receivedAt = params.receivedAt;
    this.request = params.request;

    Object.freeze(this);
  }
}
