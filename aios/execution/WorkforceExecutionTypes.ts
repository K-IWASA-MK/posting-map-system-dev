import { TaskStepPlan } from '../orchestration/task/TaskTypes';

export type ExecutionStatus =
  | "CREATED"
  | "INITIALIZING"
  | "RUNNING"
  | "WAITING_RETRY"
  | "COMPLETED"
  | "FAILED"
  | "INTERCEPTED";

export interface AgentTaskPromptContext {
  readonly assignmentId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly projectId: string;
  readonly taskObjective: string;
  readonly steps: readonly TaskStepPlan[];
  readonly allowedTools: readonly string[];
  readonly sandboxBoundaries: readonly string[];
  readonly taskLedgerRef: string;
  readonly memorySnapshotRef?: string;
  readonly executionPolicyRef?: string;
}

export type ExecutionEventType =
  | "STARTED"
  | "STEP_COMPLETED"
  | "TOOL_CALLED"
  | "SANDBOX_VIOLATION"
  | "RETRY"
  | "COMPLETED"
  | "FAILED";

export interface ExecutionEvent {
  readonly executionId: string;
  readonly eventType: ExecutionEventType;
  readonly timestamp: number;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface SandboxAccessRequest {
  readonly path?: string;
  readonly permission?: string;
}

export interface SandboxValidationResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly violationType?: "PATH_TRAVERSAL" | "UNAUTHORIZED_PATH" | "UNAUTHORIZED_PERMISSION";
}

export interface RecoveryDecision {
  readonly action: "PROCEED" | "RETRY" | "HALT";
  readonly reason: string;
  readonly attemptsRemaining: number;
}

export interface ExecutionStepResult {
  readonly stepNumber: number;
  readonly status: "PASSED" | "FAILED" | "RETRY_WARNING" | "INTERCEPTED";
  readonly outputSummary: string;
  readonly error?: string;
}

export interface WorkforceExecutionResult {
  readonly executionId: string;
  readonly assignmentId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly projectId: string;
  readonly status: ExecutionStatus;
  readonly stepResults: readonly ExecutionStepResult[];
  readonly events: readonly ExecutionEvent[];
  readonly executionContextHash: string;
  readonly violationsCount: number;
  readonly executedAt: number;
}
