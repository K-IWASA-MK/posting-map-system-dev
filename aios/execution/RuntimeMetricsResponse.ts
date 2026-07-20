import { RuntimeMetricsState } from "./RuntimeMetricsState";
import { RuntimeMetricsSummary } from "./RuntimeMetricsSummary";

export interface RuntimeMetricsResponse {
  readonly metrics: RuntimeMetricsState;
  readonly summary: RuntimeMetricsSummary;
}
