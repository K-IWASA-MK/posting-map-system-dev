export interface QueueSnapshot {
  readonly timestamp: number;
  readonly depth: number;
  readonly running: number;
  readonly waiting: number;
  readonly blocked: number;
  readonly preempted: number;
}
