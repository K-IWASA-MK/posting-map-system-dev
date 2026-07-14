export enum CheckpointType {
  BEFORE = "BEFORE",
  AFTER = "AFTER",
  AUTO = "AUTO",
  MANUAL = "MANUAL",
  RECOVERY = "RECOVERY"
}

export interface ExecutionCheckpoint {
  readonly checkpointId: string;
  readonly sessionId: string;
  readonly type: CheckpointType;
  readonly stateData: any;
  readonly createdAt: number;
}
