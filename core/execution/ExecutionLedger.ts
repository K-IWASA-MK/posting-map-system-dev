import { ExecutionSession } from "./ExecutionSession";
import { ExecutionStep } from "./ExecutionStep";
import { ExecutionCheckpoint } from "./ExecutionCheckpoint";
import { ExecutionResult } from "./ExecutionResult";

export interface SessionLedger {
  appendSession(session: ExecutionSession): void;
}

export interface StepLedger {
  appendStep(step: ExecutionStep, result: any): void;
}

export interface CheckpointLedger {
  appendCheckpoint(checkpoint: ExecutionCheckpoint): void;
}

export interface ClaimLedger {
  appendClaim(ticketId: string, timestamp: number): void;
}

export interface ResultLedger {
  appendResult(sessionId: string, result: ExecutionResult): void;
}

export interface RollbackLedger {
  appendRollback(sessionId: string, timestamp: number): void;
}

export interface TimeoutLedger {
  appendTimeout(sessionId: string, timestamp: number): void;
}

export interface HistoryLedger {
  appendHistory(record: any): void;
}

export interface AuditLedger {
  appendAudit(tag: string, sessionId: string, payload: any): void;
}
