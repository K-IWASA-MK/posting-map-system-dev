import { ExecutionRecord } from '../../models/kernel';
import { IExecutionLedger } from '../../models/runtime_ports';

/**
 * InMemoryExecutionLedger
 * 
 * In-memory implementation of the Execution Ledger for testing and default environments.
 * Strictly Append Only.
 */
export class InMemoryExecutionLedger implements IExecutionLedger {
  private readonly records: ExecutionRecord[] = [];

  async append(record: ExecutionRecord): Promise<void> {
    this.records.push(record);
  }

  // Helper method for testing
  getRecords(): readonly ExecutionRecord[] {
    return [...this.records];
  }
}
