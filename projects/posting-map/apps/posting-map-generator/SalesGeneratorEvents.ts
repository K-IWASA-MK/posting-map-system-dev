export type SalesGeneratorEventType =
  | "GENERATION_STARTED"
  | "GENERATION_PROGRESS"
  | "GENERATION_COMPLETED"
  | "GENERATION_FAILED";

export interface SalesGeneratorEvent {
  readonly type: SalesGeneratorEventType;
  readonly sessionId: string;
  readonly requestId: string;
  readonly districtId: string;
  readonly districtName: string;
  readonly timestamp: number;
  readonly progress: number;
  readonly currentTask: string;
  readonly completedTasks: readonly string[];
  readonly error?: string;
}
