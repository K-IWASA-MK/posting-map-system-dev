import { RuntimeMetric } from "../metrics/RuntimeMetrics";

export type HealthState = "HEALTHY" | "WARNING" | "DEGRADED" | "FAILED";

export const HEALTH_THRESHOLDS = {
  warningFailureRate: 0.1,    // 10%
  degradedFailureRate: 0.3,   // 30%
  failedFailureRate: 0.5      // 50%
};

export class RuntimeHealthEvaluator {
  /**
   * Asserts the health status of a runtime based on failure rates.
   * Utilizes configurable thresholds in HEALTH_THRESHOLDS.
   */
  public static evaluate(metric: RuntimeMetric): HealthState {
    if (metric.executionCount === 0) {
      return "HEALTHY";
    }

    const failureRate = metric.failureCount / metric.executionCount;

    if (failureRate >= HEALTH_THRESHOLDS.failedFailureRate) {
      return "FAILED";
    }
    if (failureRate >= HEALTH_THRESHOLDS.degradedFailureRate) {
      return "DEGRADED";
    }
    if (failureRate >= HEALTH_THRESHOLDS.warningFailureRate) {
      return "WARNING";
    }

    return "HEALTHY";
  }
}
