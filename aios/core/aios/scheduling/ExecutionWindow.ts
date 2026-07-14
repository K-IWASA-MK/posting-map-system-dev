export interface ExecutionWindow {
  readonly startTime: number;
  readonly endTime: number;
  readonly maxDelayMs: number;
  readonly deadline: number;
}
