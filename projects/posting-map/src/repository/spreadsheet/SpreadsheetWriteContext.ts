import { RepositoryUpdateRequest } from '../../../src/application/task-result';

export class SpreadsheetWriteContext {
  public readonly request: RepositoryUpdateRequest;
  public readonly sheetName: string;
  public readonly rowKey: string;
  public readonly idempotencyKey: string;
  public readonly requestId: string;
  public readonly correlationId: string;
  public readonly executionId: string;

  constructor(params: {
    request: RepositoryUpdateRequest;
    sheetName: string;
    rowKey: string;
    idempotencyKey: string;
    requestId: string;
    correlationId: string;
    executionId: string;
  }) {
    this.request = params.request;
    this.sheetName = params.sheetName;
    this.rowKey = params.rowKey;
    this.idempotencyKey = params.idempotencyKey;
    this.requestId = params.requestId;
    this.correlationId = params.correlationId;
    this.executionId = params.executionId;

    Object.freeze(this);
  }
}
