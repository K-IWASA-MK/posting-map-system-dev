export interface InitializationRequest {
  readonly requestId: string;
  readonly districtId: string;
  readonly districtName: string;
  readonly sourceHash: string;
}

export type InitializationEventType =
  | "INIT_STARTED"
  | "INIT_TASK_COMPLETED"
  | "INIT_TASK_FAILED"
  | "INIT_SUCCESS"
  | "INIT_FAILED";

export interface InitializationEvent {
  readonly type: InitializationEventType;
  readonly requestId: string;
  readonly districtName: string;
  readonly timestamp: number;
  readonly taskType?: string;
  readonly error?: string;
}
