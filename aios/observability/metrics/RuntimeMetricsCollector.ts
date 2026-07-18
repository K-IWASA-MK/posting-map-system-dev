import { ObservabilityEvent } from "../contracts/ObservabilityEventContract";
import { RuntimeMetric } from "./RuntimeMetrics";

export class RuntimeMetricsCollector {
  /**
   * Recalculates and aggregates metrics for a specific runtime based on the new event.
   * Returns a frozen RuntimeMetric instance to guarantee immutability.
   */
  public static collect(event: ObservabilityEvent, current?: RuntimeMetric): RuntimeMetric {
    const runtime = event.runtime;
    const isSuccess = event.status === "SUCCESS";
    const isFailure = event.status === "FAILED" || event.status === "BLOCKED";

    const prevCount = current ? current.executionCount : 0;
    const prevSuccess = current ? current.successCount : 0;
    const prevFailure = current ? current.failureCount : 0;
    const prevAvgDuration = current ? current.averageDuration : 0;

    const newCount = prevCount + 1;
    const newSuccess = prevSuccess + (isSuccess ? 1 : 0);
    const newFailure = prevFailure + (isFailure ? 1 : 0);
    
    // Rolling average duration calculation
    const newAvgDuration = Math.round(
      (prevAvgDuration * prevCount + event.duration) / newCount
    );

    return Object.freeze({
      runtime,
      executionCount: newCount,
      successCount: newSuccess,
      failureCount: newFailure,
      averageDuration: newAvgDuration,
      lastExecutedAt: event.timestamp
    });
  }
}
