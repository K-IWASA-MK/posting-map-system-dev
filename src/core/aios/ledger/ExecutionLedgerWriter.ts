import { ExecutionLedgerEntry } from './ExecutionLedgerEntry';

export interface IExecutionLedgerWriter {
  append(entry: ExecutionLedgerEntry): Promise<void>;
  appendAll(entries: ExecutionLedgerEntry[]): Promise<void>;
  flush(): Promise<void>;
}
