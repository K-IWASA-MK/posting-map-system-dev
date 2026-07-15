import { ExecutionLedgerEntry } from './ExecutionLedgerEntry';
import { ExecutionLedgerMetadata } from './ExecutionLedgerMetadata';
import { ExecutionLedgerStatus } from './ExecutionLedgerStatus';

export interface ExecutionLedger {
  readonly executionId: string;
  readonly contextId: string;
  readonly sessionId: string;
  readonly status: ExecutionLedgerStatus;
  readonly entries: readonly ExecutionLedgerEntry[];
  readonly createdAt: string;
  readonly version: string;
  readonly metadata: ExecutionLedgerMetadata;
}
