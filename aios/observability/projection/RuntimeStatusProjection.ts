import { HealthState } from "../health/RuntimeHealthEvaluator";
import { RuntimeMetric } from "../metrics/RuntimeMetrics";
import { ObservabilityEvent } from "../contracts/ObservabilityEventContract";

export interface RuntimeStatusProjection {
  readonly runtime: string;
  readonly health: HealthState;
  readonly metrics: RuntimeMetric;
  readonly lastTrace?: ObservabilityEvent;
  readonly updatedAt: number;
}

export class RuntimeStatusProjectionBuilder {
  /**
   * Constructs an immutable, frozen RuntimeStatusProjection view representation.
   */
  public static build(
    runtime: string,
    health: HealthState,
    metrics: RuntimeMetric,
    lastTrace?: ObservabilityEvent
  ): RuntimeStatusProjection {
    return Object.freeze({
      runtime,
      health,
      metrics,
      lastTrace,
      updatedAt: Date.now()
    });
  }
}
