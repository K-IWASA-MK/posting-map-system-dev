import { RuntimeMetricsRequest } from "./RuntimeMetricsRequest";
import { RuntimeMetricsResponse } from "./RuntimeMetricsResponse";

export interface RuntimeMetricsProvider {
  createRuntimeMetrics(
    request: RuntimeMetricsRequest
  ): RuntimeMetricsResponse;
}
