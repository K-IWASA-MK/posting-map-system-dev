export interface WorkflowRecord {
  workflowId: string;
  manifestId: string;
  status: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  triggerEvent?: string;
  contextSnapshot: string;
}

export class WorkflowLedger {
  private readonly records: Map<string, WorkflowRecord> = new Map();

  public recordStart(workflowId: string, manifestId: string, triggerEvent: string, contextSnapshot: string): void {
    this.records.set(workflowId, {
      workflowId,
      manifestId,
      status: 'RUNNING',
      startTime: new Date().toISOString(),
      triggerEvent,
      contextSnapshot
    });
  }

  public recordCompletion(workflowId: string, status: string, durationMs: number): void {
    const record = this.records.get(workflowId);
    if (record) {
      record.status = status;
      record.endTime = new Date().toISOString();
      record.durationMs = durationMs;
      this.records.set(workflowId, record);
    }
  }

  public getRecord(workflowId: string): WorkflowRecord | undefined {
    return this.records.get(workflowId);
  }

  public getAllRecords(): WorkflowRecord[] {
    return Array.from(this.records.values());
  }
}
