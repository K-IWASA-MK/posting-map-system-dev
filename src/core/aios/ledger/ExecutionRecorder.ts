import { IExecutionLedgerWriter } from './ExecutionLedgerWriter';
import { ExecutionLedgerEntry } from './ExecutionLedgerEntry';
import { ExecutionLedgerEntryType } from './ExecutionLedgerEntryType';

/**
 * Facade between the Engine/Orchestrator and the LedgerWriter.
 * Manages sequence numbers, correlation IDs, and event trees (parent Entry ID).
 */
export class ExecutionRecorder {
  private writer: IExecutionLedgerWriter;
  private executionId: string;
  private correlationId: string;
  private sequenceNo: number = 0;
  private lastEntryId?: string;

  constructor(writer: IExecutionLedgerWriter, executionId: string, correlationId: string) {
    this.writer = writer;
    this.executionId = executionId;
    this.correlationId = correlationId;
  }

  public async record(entryType: ExecutionLedgerEntryType, payload: Record<string, unknown>): Promise<string> {
    this.sequenceNo++;
    const entryId = `EVT-${Date.now()}-${this.sequenceNo}`;

    const entry: ExecutionLedgerEntry = Object.freeze({
      entryId,
      executionId: this.executionId,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString(),
      entryType,
      payload: Object.freeze({ ...payload }),
      version: '1.0',
      sequenceNo: this.sequenceNo,
      parentEntryId: this.lastEntryId // Links to the previous event in the chain
    });

    await this.writer.append(entry);
    this.lastEntryId = entryId;

    return entryId;
  }

  public async flush(): Promise<void> {
    await this.writer.flush();
  }
}
