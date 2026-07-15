import { ExecutionLedger } from './ExecutionLedger';
import { ExecutionLedgerEntry } from './ExecutionLedgerEntry';

export interface IExecutionLedgerReader {
  findByExecutionId(executionId: string): Promise<ExecutionLedger | null>;
  findByContextId(contextId: string): Promise<ExecutionLedger[]>;
  findByDecisionId(decisionId: string): Promise<ExecutionLedgerEntry | null>; // Specifically search for a GOVERNANCE/DECISION entry
  findAll(): Promise<ExecutionLedger[]>;
}
