import { ExecutionLedgerEntryType } from './ExecutionLedgerEntryType';

export interface ExecutionLedgerEntry {
  readonly entryId: string;
  readonly executionId: string;
  readonly correlationId: string; // Grouping related events together
  readonly timestamp: string;
  readonly entryType: ExecutionLedgerEntryType;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly version: string;
  readonly sequenceNo: number; // Order within the execution/correlation
  readonly parentEntryId?: string; // Forming an event tree (e.g. Validation -> Review)
}
