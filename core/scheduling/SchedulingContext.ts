export interface SchedulingContext {
  readonly traceId: string;
  readonly requirementId: string;
  readonly allocationId: string;
  readonly submittedAt: number;
}
