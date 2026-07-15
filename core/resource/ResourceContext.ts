export interface ResourceContext {
  readonly traceId: string;
  readonly planId: string;
  readonly sourceRuntime: string;
  readonly targetRuntime: string;
  readonly timestamp: number;
}
