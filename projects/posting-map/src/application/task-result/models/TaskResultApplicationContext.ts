import { TaskResultPayload } from '../../../integration/aios/callback/TaskResultPayload';

export class TaskResultApplicationContext {
  public readonly taskResult: TaskResultPayload;
  public readonly receivedAt: Date;
  public readonly correlationId: string;
  public readonly executionId: string;
  public readonly requestId?: string;

  constructor(params: {
    taskResult: TaskResultPayload;
    receivedAt: Date;
    correlationId: string;
    executionId: string;
    requestId?: string;
  }) {
    this.taskResult = params.taskResult;
    this.receivedAt = params.receivedAt;
    this.correlationId = params.correlationId;
    this.executionId = params.executionId;
    this.requestId = params.requestId;
    
    // Ensure Context is Immutable
    Object.freeze(this);
  }
}
