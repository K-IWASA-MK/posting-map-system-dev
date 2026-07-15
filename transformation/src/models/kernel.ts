export type ExecutionId = string;
export type TrustLevel = 'SYSTEM' | 'INTERNAL' | 'EXTERNAL' | 'UNTRUSTED';

/**
 * CancellationToken
 * Passed via the ExecutionContext to allow external systems to signal cancellation
 * directly to the ExecutionKernel and the running Worker.
 */
export interface CancellationToken {
  readonly isCancellationRequested: boolean;
  onCancellationRequested(listener: () => void): void;
}

/**
 * ExecutionContext
 * The immutable contract defining the environment for a specific execution.
 * It holds NO state about the execution progress itself.
 */
export interface ExecutionContext {
  readonly executionId: ExecutionId;
  readonly traceId: string;
  readonly startedAt: string;
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly remainingBudget: number;
  readonly trustLevel: TrustLevel;
  readonly cancellationToken: CancellationToken;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * ExecutionAttempt
 * Represents a single, specific attempt within an ExecutionContext.
 * The Worker receives this attempt object, fully separating the eternal contract (Context)
 * from the volatile occurrence (Attempt).
 */
export interface ExecutionAttempt {
  readonly executionId: ExecutionId;
  readonly attempt: number;
  readonly startedAt: string;
  readonly timeoutAt: string;
}

/**
 * ExecutionPhase
 * Represents the lifecycle state of a single execution attempt.
 */
export type ExecutionPhase = "QUEUED" | "DISPATCHED" | "STARTED" | "COMPLETED" | "FAILED" | "TIMEOUT" | "CANCELLED";

/**
 * ExecutionRecord
 * An immutable fact recorded in the Execution Ledger. It does NOT contain the 
 * command payload, but merely records the lifecycle boundaries of the execution.
 */
export interface ExecutionRecord {
  readonly executionId: ExecutionId;
  readonly attempt: number;
  readonly timestamp: string;
  readonly phase: ExecutionPhase;
  readonly commandId: string;
  readonly workerId: string;
}

