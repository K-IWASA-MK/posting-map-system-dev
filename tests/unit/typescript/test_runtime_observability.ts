import { ObservabilityRuntime } from "../../../aios/observability/runtime/ObservabilityRuntime";
import { TraceQueryService } from "../../../aios/observability/trace/TraceQueryService";
import { ObservabilityEvent } from "../../../aios/observability/contracts/ObservabilityEventContract";
import { RuntimeMetricsCollector } from "../../../aios/observability/metrics/RuntimeMetricsCollector";
import { RuntimeHealthEvaluator } from "../../../aios/observability/health/RuntimeHealthEvaluator";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTest() {
  console.log("🧪 Running Runtime Observability Foundation Test...\n");

  // ==========================================
  // Scenario 1: Runtime Metrics Collection
  // ==========================================
  {
    const traceQuery = new TraceQueryService();
    const runtime = new ObservabilityRuntime(traceQuery);

    const event1: ObservabilityEvent = {
      eventId: "EV-001",
      traceId: "TR-001",
      runtime: "ValidationRuntime",
      eventType: "RUNTIME_COMPLETED",
      timestamp: 1000,
      duration: 100,
      status: "SUCCESS",
      metadata: {},
      schemaVersion: "v1"
    };

    const event2: ObservabilityEvent = {
      eventId: "EV-002",
      traceId: "TR-001",
      runtime: "ValidationRuntime",
      eventType: "RUNTIME_FAILED",
      timestamp: 2000,
      duration: 200,
      status: "FAILED",
      metadata: {},
      schemaVersion: "v1"
    };

    runtime.ingest(event1);
    runtime.ingest(event2);

    const metrics = runtime.getMetrics("ValidationRuntime");
    assert(metrics !== undefined, "Metrics should be defined.");
    assert(metrics!.executionCount === 2, "Execution count matches.");
    assert(metrics!.successCount === 1, "Success count matches.");
    assert(metrics!.failureCount === 1, "Failure count matches.");
    assert(metrics!.averageDuration === 150, "Average duration matches (100 + 200) / 2.");
    assert(metrics!.lastExecutedAt === 2000, "lastExecutedAt matches latest timestamp.");

    console.log("   ✓ Runtime Metrics Collection verified.");
  }

  // ==========================================
  // Scenario 2 & 8: Health Evaluation Transition & Threshold Boundaries
  // ==========================================
  {
    const traceQuery = new TraceQueryService();
    const runtime = new ObservabilityRuntime(traceQuery);

    // Helper to ingest generic success/failure event
    const ingestEvent = (id: string, status: "SUCCESS" | "FAILED", duration: number = 50) => {
      runtime.ingest({
        eventId: id,
        traceId: `TR-${id}`,
        runtime: "CompletionRuntime",
        eventType: status === "SUCCESS" ? "RUNTIME_COMPLETED" : "RUNTIME_FAILED",
        timestamp: Date.now(),
        duration,
        status,
        metadata: {},
        schemaVersion: "v1"
      });
    };

    // 1. Initially clean (0 failures out of 5 executions) -> HEALTHY
    for (let i = 0; i < 5; i++) {
      ingestEvent(`E-CL-${i}`, "SUCCESS");
    }
    assert(runtime.getProjection("CompletionRuntime")!.health === "HEALTHY", "Should be HEALTHY initially.");

    // Clear stats for boundary checks
    runtime.clear();

    // 2. Failure rate is 10% (1 failure out of 10 executions) -> WARNING
    for (let i = 0; i < 9; i++) ingestEvent(`E-W1-${i}`, "SUCCESS");
    ingestEvent("E-W1-F", "FAILED");
    assert(runtime.getProjection("CompletionRuntime")!.health === "WARNING", "10% failure rate should be WARNING.");

    runtime.clear();

    // 3. Failure rate is 20% (2 failures out of 10 executions) -> WARNING (under degraded threshold 30%)
    for (let i = 0; i < 8; i++) ingestEvent(`E-W2-${i}`, "SUCCESS");
    ingestEvent("E-W2-F1", "FAILED");
    ingestEvent("E-W2-F2", "FAILED");
    assert(runtime.getProjection("CompletionRuntime")!.health === "WARNING", "20% failure rate should still be WARNING.");

    runtime.clear();

    // 4. Failure rate is 30% (3 failures out of 10 executions) -> DEGRADED
    for (let i = 0; i < 7; i++) ingestEvent(`E-DG-${i}`, "SUCCESS");
    for (let i = 0; i < 3; i++) ingestEvent(`E-DG-F${i}`, "FAILED");
    assert(runtime.getProjection("CompletionRuntime")!.health === "DEGRADED", "30% failure rate should be DEGRADED.");

    runtime.clear();

    // 5. Failure rate is 50% (5 failures out of 10 executions) -> FAILED
    for (let i = 0; i < 5; i++) ingestEvent(`E-FL-${i}`, "SUCCESS");
    for (let i = 0; i < 5; i++) ingestEvent(`E-FL-F${i}`, "FAILED");
    assert(runtime.getProjection("CompletionRuntime")!.health === "FAILED", "50% failure rate should be FAILED.");

    console.log("   ✓ Health Evaluation & Threshold Boundaries verified.");
  }

  // ==========================================
  // Scenario 3: Trace Query Filtering
  // ==========================================
  {
    const traceQuery = new TraceQueryService();
    const runtime = new ObservabilityRuntime(traceQuery);

    runtime.ingest({
      eventId: "EV-Q-1",
      traceId: "TR-MATCH",
      runtime: "ValidationRuntime",
      eventType: "RUNTIME_COMPLETED",
      timestamp: 100,
      duration: 10,
      status: "SUCCESS",
      metadata: {},
      schemaVersion: "v1"
    });

    runtime.ingest({
      eventId: "EV-Q-2",
      traceId: "TR-OTHER",
      runtime: "AuditRuntime",
      eventType: "RUNTIME_FAILED",
      timestamp: 200,
      duration: 20,
      status: "FAILED",
      metadata: {},
      schemaVersion: "v1"
    });

    // Query traceId filter
    const matchesTrace = traceQuery.query({ traceId: "TR-MATCH" });
    assert(matchesTrace.length === 1 && matchesTrace[0].eventId === "EV-Q-1", "Trace filter matches.");

    // Query runtime filter
    const matchesRuntime = traceQuery.query({ runtime: "AuditRuntime" });
    assert(matchesRuntime.length === 1 && matchesRuntime[0].eventId === "EV-Q-2", "Runtime filter matches.");

    // Query status filter
    const matchesStatus = traceQuery.query({ status: "SUCCESS" });
    assert(matchesStatus.length === 1 && matchesStatus[0].eventId === "EV-Q-1", "Status filter matches.");

    console.log("   ✓ Trace Query Filtering verified.");
  }

  // ==========================================
  // Scenario 4 & 9: Status Projection & Immutability
  // ==========================================
  {
    const traceQuery = new TraceQueryService();
    const runtime = new ObservabilityRuntime(traceQuery);

    runtime.ingest({
      eventId: "EV-P-1",
      traceId: "TR-P-1",
      runtime: "ValidationRuntime",
      eventType: "RUNTIME_COMPLETED",
      timestamp: 500,
      duration: 50,
      status: "SUCCESS",
      metadata: {},
      schemaVersion: "v1"
    });

    const projection = runtime.getProjection("ValidationRuntime");
    assert(projection !== undefined, "Projection read model must exist.");
    assert(projection!.runtime === "ValidationRuntime", "Runtime key matches.");
    assert(projection!.health === "HEALTHY", "Health matches.");
    assert(projection!.metrics.executionCount === 1, "Metrics nesting verified.");

    // Verify Immutability: attempts to modify frozen read model must throw in strict mode
    let threwMutate = false;
    try {
      (projection as any).health = "FAILED";
    } catch (e) {
      threwMutate = true;
    }
    assert(threwMutate === true, "Projection modifications must be blocked (Immutability).");

    let threwNestedMutate = false;
    try {
      (projection!.metrics as any).executionCount = 999;
    } catch (e) {
      threwNestedMutate = true;
    }
    assert(threwNestedMutate === true, "Nested Metrics modifications must be blocked (Immutability).");

    console.log("   ✓ Status Projection & Immutability verified.");
  }

  // ==========================================
  // Scenario 5: Invalid Event Contract Block
  // ==========================================
  {
    const traceQuery = new TraceQueryService();
    const runtime = new ObservabilityRuntime(traceQuery);

    const invalidEvent = {
      eventId: "EV-ERR",
      traceId: "TR-ERR",
      runtime: "ValidationRuntime",
      eventType: "RUNTIME_COMPLETED" as const,
      timestamp: 100,
      duration: 10,
      status: "SUCCESS" as const,
      metadata: {},
      schemaVersion: "v999" // Version mismatch
    };

    let threw: boolean = false;
    try {
      runtime.ingest(invalidEvent);
    } catch (e) {
      threw = true;
    }
    assert(threw === true, "Should throw and block on invalid version contracts.");

    console.log("   ✓ Invalid Event Contract Block verified.");
  }

  // ==========================================
  // Scenario 6: Non Blocking Metrics / Health Failure
  // ==========================================
  {
    const traceQuery = new TraceQueryService();
    const runtime = new ObservabilityRuntime(traceQuery);

    // Ingest a normal first event
    runtime.ingest({
      eventId: "EV-OK-1",
      traceId: "TR-OK",
      runtime: "ValidationRuntime",
      eventType: "RUNTIME_COMPLETED",
      timestamp: 100,
      duration: 10,
      status: "SUCCESS",
      metadata: {},
      schemaVersion: "v1"
    });

    // Monkeypatch collector to throw error
    const originalCollect = RuntimeMetricsCollector.collect;
    RuntimeMetricsCollector.collect = () => {
      throw new Error("Simulated collector crash.");
    };

    let threwCollect: boolean = false;
    try {
      runtime.ingest({
        eventId: "EV-OK-2",
        traceId: "TR-OK",
        runtime: "ValidationRuntime",
        eventType: "RUNTIME_COMPLETED",
        timestamp: 200,
        duration: 20,
        status: "SUCCESS",
        metadata: {},
        schemaVersion: "v1"
      });
    } catch (e) {
      threwCollect = true;
    }

    // Restore collector
    RuntimeMetricsCollector.collect = originalCollect;

    assert(threwCollect === false, "Orchestrator must handle metrics exceptions gracefully without crashing.");
    // Metrics should have fallen back to previous state
    assert(runtime.getMetrics("ValidationRuntime")!.executionCount === 1, "Fallback metrics applied.");

    // Monkeypatch health evaluator to throw
    const originalEvaluate = RuntimeHealthEvaluator.evaluate;
    RuntimeHealthEvaluator.evaluate = () => {
      throw new Error("Simulated health crash.");
    };

    let threwHealth: boolean = false;
    try {
      runtime.ingest({
        eventId: "EV-OK-3",
        traceId: "TR-OK",
        runtime: "ValidationRuntime",
        eventType: "RUNTIME_COMPLETED",
        timestamp: 300,
        duration: 30,
        status: "SUCCESS",
        metadata: {},
        schemaVersion: "v1"
      });
    } catch (e) {
      threwHealth = true;
    }

    // Restore health evaluator
    RuntimeHealthEvaluator.evaluate = originalEvaluate;

    assert(threwHealth === false, "Orchestrator must handle health evaluator exceptions gracefully without crashing.");
    assert(runtime.getProjection("ValidationRuntime")!.health === "WARNING", "Fallback status WARNING applied.");

    console.log("   ✓ Non-blocking Metrics & Health Failure verified.");
  }

  // ==========================================
  // Scenario 7: Replay Event Safety
  // ==========================================
  {
    const traceQuery = new TraceQueryService();
    const runtime = new ObservabilityRuntime(traceQuery);

    const event: ObservabilityEvent = {
      eventId: "EV-REPLAY",
      traceId: "TR-REPLAY",
      runtime: "ValidationRuntime",
      eventType: "RUNTIME_COMPLETED",
      timestamp: 1000,
      duration: 100,
      status: "SUCCESS",
      metadata: {},
      schemaVersion: "v1"
    };

    // Double ingestion
    runtime.ingest(event);
    runtime.ingest(event);

    const metrics = runtime.getMetrics("ValidationRuntime");
    assert(metrics!.executionCount === 1, "Replay safety blocks multiple additions.");

    console.log("   ✓ Replay Event Safety verified.");
  }

  console.log("\n==========================================");
  console.log("🎉 RUNTIME OBSERVABILITY FOUNDATION PASSED");
  console.log("==========================================\n");
}

runTest().catch((err) => {
  console.error("❌ Test failed with error:", err);
  process.exit(1);
});
