import { ObservabilityEvent } from "../contracts/ObservabilityEventContract";
import { RuntimeMetric } from "../metrics/RuntimeMetrics";
import { RuntimeMetricsCollector } from "../metrics/RuntimeMetricsCollector";
import { RuntimeHealthEvaluator, HealthState } from "../health/RuntimeHealthEvaluator";
import { TraceQueryService } from "../trace/TraceQueryService";
import { RuntimeStatusProjection, RuntimeStatusProjectionBuilder } from "../projection/RuntimeStatusProjection";

export class ObservabilityRuntime {
  private readonly traceQuery: TraceQueryService;
  private readonly metricsMap = new Map<string, RuntimeMetric>();
  private readonly projectionsMap = new Map<string, RuntimeStatusProjection>();
  private readonly processedEvents = new Set<string>();

  constructor(traceQuery: TraceQueryService) {
    this.traceQuery = traceQuery;
  }

  /**
   * Resolves the current status projection read model for a target runtime.
   */
  public getProjection(runtime: string): RuntimeStatusProjection | undefined {
    return this.projectionsMap.get(runtime);
  }

  /**
   * Resolves the current collected metrics for a target runtime.
   */
  public getMetrics(runtime: string): RuntimeMetric | undefined {
    return this.metricsMap.get(runtime);
  }

  /**
   * Processes an incoming ObservabilityEvent.
   * Performs validation, deduplication, rolling metrics aggregation, health checks, and state projection updates.
   */
  public ingest(event: ObservabilityEvent): void {
    // 1. Validate Event Contract (Block on validation failures)
    const requiredKeys: (keyof ObservabilityEvent)[] = [
      "eventId",
      "traceId",
      "runtime",
      "eventType",
      "timestamp",
      "duration",
      "status",
      "schemaVersion"
    ];
    let isContractValid = true;
    let contractError: string | undefined;

    for (const key of requiredKeys) {
      if (event[key] === undefined || event[key] === null) {
        isContractValid = false;
        contractError = `Missing required field: ${key}`;
        break;
      }
    }

    if (isContractValid && event.schemaVersion !== "v1") {
      isContractValid = false;
      contractError = `Unsupported schemaVersion: ${event.schemaVersion}. Expected: v1`;
    }

    if (!isContractValid) {
      throw new Error(`[ObservabilityRuntime] Event contract invalid: ${contractError}`);
    }

    // 2. Replay Safety Check (Skip processed eventIds)
    if (this.processedEvents.has(event.eventId)) {
      console.log(`[ObservabilityRuntime] Replay Safety: Event ${event.eventId} already processed. Skipping.`);
      return;
    }
    this.processedEvents.add(event.eventId);

    // 3. Record trace in TraceQueryService
    this.traceQuery.record(event);

    // 4. Recalculate Metrics (Non-blocking exception handling)
    let metrics: RuntimeMetric;
    const currentMetrics = this.metricsMap.get(event.runtime);
    try {
      metrics = RuntimeMetricsCollector.collect(event, currentMetrics);
      this.metricsMap.set(event.runtime, metrics);
    } catch (err: any) {
      console.warn(`[ObservabilityRuntime] Metrics collection failed gracefully: ${err.message}`);
      metrics = currentMetrics || Object.freeze({
        runtime: event.runtime,
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageDuration: 0,
        lastExecutedAt: Date.now()
      });
    }

    // 5. Evaluate Health (Non-blocking exception handling)
    let health: HealthState;
    try {
      health = RuntimeHealthEvaluator.evaluate(metrics);
    } catch (err: any) {
      console.warn(`[ObservabilityRuntime] Health evaluation failed gracefully: ${err.message}`);
      health = "WARNING";
    }

    // 6. Update Projection Read Model
    const projection = RuntimeStatusProjectionBuilder.build(
      event.runtime,
      health,
      metrics,
      event
    );
    this.projectionsMap.set(event.runtime, projection);
  }

  /**
   * Clears internal metrics, projections, and processed caches.
   */
  public clear(): void {
    this.metricsMap.clear();
    this.projectionsMap.clear();
    this.processedEvents.clear();
  }
}
