export interface RuntimeResponse {
  readonly runtimeId: string;
  readonly status: string;
  readonly confidence: number;
  readonly recommendation: string;
  readonly latency: number;
  readonly timestamp: number;
  readonly traceId: string;
}
