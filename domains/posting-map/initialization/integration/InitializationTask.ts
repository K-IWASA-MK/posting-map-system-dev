export type InitializationAgentType =
  | "DISTRICT_MASTER"
  | "AREA_GENERATION"
  | "ELECTION_DATA"
  | "VISUALIZATION"
  | "DASHBOARD";

export type InitializationTaskStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface InitializationTask {
  readonly taskId: string;
  readonly agentType: InitializationAgentType;
  readonly status: InitializationTaskStatus;
  readonly error?: string;
}
