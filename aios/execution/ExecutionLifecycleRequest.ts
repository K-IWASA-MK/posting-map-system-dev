import { RuntimeMetricsResponse } from "./RuntimeMetricsResponse";

export interface ExecutionLifecycleRequest {
  readonly runtimeMetrics: RuntimeMetricsResponse;
}
