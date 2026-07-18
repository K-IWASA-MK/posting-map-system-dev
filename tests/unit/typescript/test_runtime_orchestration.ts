import { RuntimeOrchestrator } from "../../../aios/orchestration/runtime/RuntimeOrchestrator";
import { RuntimeRegistry } from "../../../aios/orchestration/registry/RuntimeRegistry";
import { RuntimeEventBus } from "../../../aios/orchestration/events/RuntimeEventBus";
import { RuntimeIntegrationTrace } from "../../../aios/orchestration/runtime/RuntimeIntegrationTrace";
import { RuntimeEvent } from "../../../aios/orchestration/contracts/RuntimeEventContract";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTest() {
  console.log("🧪 Running Runtime Integration Orchestration Foundation Test...\n");

  // ==========================================
  // Scenario 1 & Ordering: Normal Runtime Chain
  // ==========================================
  {
    const registry = new RuntimeRegistry();
    const eventBus = new RuntimeEventBus();
    const traceLogger = new RuntimeIntegrationTrace();
    const orchestrator = new RuntimeOrchestrator(registry, eventBus, traceLogger);

    const callSequence: string[] = [];

    // Register descriptors
    registry.register({ runtimeName: "ValidationRuntime", version: "1.0.0", capabilities: ["VALIDATE"] });
    registry.register({ runtimeName: "AuditRuntime", version: "1.0.0", capabilities: ["LOG"] });
    registry.register({ runtimeName: "CompletionRuntime", version: "1.0.0", capabilities: ["COMMIT"] });
    registry.register({ runtimeName: "LearningRuntime", version: "1.0.0", capabilities: ["LEARN"] });

    // Setup subscription chain using target channel routing
    eventBus.subscribe("ValidationRuntime", async (ev) => {
      callSequence.push("ValidationRuntime");
      // Fire next event
      await orchestrator.orchestrate({
        eventId: "EV-VAL-01",
        eventType: "VALIDATION_COMPLETED",
        sourceRuntime: "ValidationRuntime",
        timestamp: Date.now(),
        payload: { status: "SUCCESS" },
        schemaVersion: "v1"
      });
    });

    eventBus.subscribe("AuditRuntime", async (ev) => {
      callSequence.push("AuditRuntime");
      await orchestrator.orchestrate({
        eventId: "EV-AUD-01",
        eventType: "AUDIT_RECORDED",
        sourceRuntime: "AuditRuntime",
        timestamp: Date.now(),
        payload: { status: "SUCCESS" },
        schemaVersion: "v1"
      });
    });

    eventBus.subscribe("CompletionRuntime", async (ev) => {
      callSequence.push("CompletionRuntime");
      await orchestrator.orchestrate({
        eventId: "EV-CMP-01",
        eventType: "COMPLETION_COMPLETED",
        sourceRuntime: "CompletionRuntime",
        timestamp: Date.now(),
        payload: { status: "SUCCESS" },
        schemaVersion: "v1"
      });
    });

    eventBus.subscribe("LearningRuntime", async (ev) => {
      callSequence.push("LearningRuntime");
      await orchestrator.orchestrate({
        eventId: "EV-LRN-01",
        eventType: "LEARNING_UPDATED",
        sourceRuntime: "LearningRuntime",
        timestamp: Date.now(),
        payload: { status: "SUCCESS" },
        schemaVersion: "v1"
      });
    });

    // Fire initial trigger event
    const initialEvent: RuntimeEvent = {
      eventId: "EV-EXE-01",
      eventType: "EXECUTION_COMPLETED",
      sourceRuntime: "ExecutionRuntime",
      timestamp: Date.now(),
      payload: { status: "COMPLETED" },
      schemaVersion: "v1"
    };

    await orchestrator.orchestrate(initialEvent);

    // Verify ordering sequence matches design
    assert(callSequence.length === 4, "Should invoke exactly 4 targets.");
    assert(callSequence[0] === "ValidationRuntime", "Validation runs first.");
    assert(callSequence[1] === "AuditRuntime", "Audit runs second.");
    assert(callSequence[2] === "CompletionRuntime", "Completion runs third.");
    assert(callSequence[3] === "LearningRuntime", "Learning runs fourth.");

    // Verify trace logs exists
    const traces = traceLogger.getTraces();
    assert(traces.length === 4, "Should record 4 delivery traces.");
    assert(traces.every(t => t.status === "DELIVERED"), "All traces should report status DELIVERED.");

    console.log("   ✓ Normal Runtime Chain & Ordering verified.");
  }

  // ==========================================
  // Scenario 2: Invalid Event Contract
  // ==========================================
  {
    const registry = new RuntimeRegistry();
    const eventBus = new RuntimeEventBus();
    const traceLogger = new RuntimeIntegrationTrace();
    const orchestrator = new RuntimeOrchestrator(registry, eventBus, traceLogger);

    const invalidEvent = {
      eventId: "EV-ERR-01",
      eventType: "EXECUTION_COMPLETED" as const,
      sourceRuntime: "ExecutionRuntime",
      timestamp: Date.now(),
      payload: {},
      schemaVersion: "v999" // Invalid version to trigger block
    };

    let threw: boolean = false;
    try {
      await orchestrator.orchestrate(invalidEvent);
    } catch (e) {
      threw = true;
    }

    assert(threw === true, "Must throw on invalid event contracts.");
    const traces = traceLogger.getTraces();
    assert(traces.length === 1, "Trace should be logged.");
    assert(traces[0].status === "CONTRACT_INVALID", "Trace status should be CONTRACT_INVALID.");

    console.log("   ✓ Invalid Event Contract blocked verified.");
  }

  // ==========================================
  // Scenario 3: Runtime Not Found
  // ==========================================
  {
    const registry = new RuntimeRegistry(); // Registry remains empty
    const eventBus = new RuntimeEventBus();
    const traceLogger = new RuntimeIntegrationTrace();
    const orchestrator = new RuntimeOrchestrator(registry, eventBus, traceLogger);

    const event: RuntimeEvent = {
      eventId: "EV-MISSING-01",
      eventType: "EXECUTION_COMPLETED",
      sourceRuntime: "ExecutionRuntime",
      timestamp: Date.now(),
      payload: { status: "COMPLETED" },
      schemaVersion: "v1"
    };

    // ValidationRuntime is routed but missing in registry
    await orchestrator.orchestrate(event);

    const traces = traceLogger.getTraces();
    assert(traces.length === 1, "Trace should be logged.");
    assert(traces[0].status === "EVENT_FAILED", "Should report EVENT_FAILED.");
    assert(traces[0].error!.includes("is not registered"), "Error details match.");

    console.log("   ✓ Runtime Not Found handles gracefully verified.");
  }

  // ==========================================
  // Scenario 4 & Isolation: Event Delivery Failure (Exception Isolation)
  // ==========================================
  {
    const registry = new RuntimeRegistry();
    const eventBus = new RuntimeEventBus();
    const traceLogger = new RuntimeIntegrationTrace();
    const orchestrator = new RuntimeOrchestrator(registry, eventBus, traceLogger);

    registry.register({ runtimeName: "ValidationRuntime", version: "1.0.0", capabilities: ["VAL"] });

    let normalCalled: boolean = false;

    // Fail subscriber
    eventBus.subscribe("ValidationRuntime", () => {
      throw new Error("Deliberate subscriber crash.");
    });

    // Normal subscriber on same channel
    eventBus.subscribe("ValidationRuntime", () => {
      normalCalled = true;
    });

    const event: RuntimeEvent = {
      eventId: "EV-FAIL-01",
      eventType: "EXECUTION_COMPLETED",
      sourceRuntime: "ExecutionRuntime",
      timestamp: Date.now(),
      payload: { status: "COMPLETED" },
      schemaVersion: "v1"
    };

    await orchestrator.orchestrate(event);

    // Verify isolation: normal subscriber was executed despite the first one crashing
    assert(normalCalled, "Normal subscriber must execute successfully.");
    const traces = traceLogger.getTraces();
    assert(traces.length === 1, "Should log trace.");
    assert(traces[0].status === "EVENT_FAILED", "Trace status should report EVENT_FAILED.");

    console.log("   ✓ Event Delivery Failure & Runtime Isolation verified.");
  }

  // ==========================================
  // Scenario 5: Replay Event Safety
  // ==========================================
  {
    const registry = new RuntimeRegistry();
    const eventBus = new RuntimeEventBus();
    const traceLogger = new RuntimeIntegrationTrace();
    const orchestrator = new RuntimeOrchestrator(registry, eventBus, traceLogger);

    registry.register({ runtimeName: "ValidationRuntime", version: "1.0.0", capabilities: ["VAL"] });

    let callCount = 0;
    eventBus.subscribe("ValidationRuntime", () => {
      callCount++;
    });

    const event: RuntimeEvent = {
      eventId: "EV-REPLAY-01",
      eventType: "EXECUTION_COMPLETED",
      sourceRuntime: "ExecutionRuntime",
      timestamp: Date.now(),
      payload: { status: "COMPLETED" },
      schemaVersion: "v1"
    };

    // First call
    await orchestrator.orchestrate(event);
    // Second duplicate call (replay)
    await orchestrator.orchestrate(event);

    assert(callCount === 1, "Should invoke handler exactly once.");

    console.log("   ✓ Replay Event Safety verified.");
  }

  console.log("\n==========================================");
  console.log("🎉 RUNTIME ORCHESTRATION FOUNDATION PASSED");
  console.log("==========================================\n");
}

runTest().catch((err) => {
  console.error("❌ Test failed with error:", err);
  process.exit(1);
});
