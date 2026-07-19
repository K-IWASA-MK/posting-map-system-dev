import * as fs from "fs";
import * as path from "path";
import { InitializationExecutor } from "../../../domains/posting-map/initialization/integration/InitializationExecutor";
import { InitializationAgentRuntime } from "../../../domains/posting-map/initialization/integration/InitializationAgentRuntime";
import { InitializationRequest } from "../../../domains/posting-map/initialization/integration/contracts/DistrictInitializationIntegrationContract";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const TEST_DIR = path.join(__dirname, "../../../scratch/test-initialization-integration-sprint");

function setupDirs() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function runTests() {
  console.log("🧪 Running District Initialization Agent Integration Foundation Tests...\n");

  setupDirs();

  // Scenario 1, 2, 3, 4: Successful Orchestration & State Transition E2E
  // ====================================================================
  {
    console.log("Scenario 1 to 4: Testing task planning, executor delegation, and E2E state store transition...");
    const executor = new InitializationExecutor();
    const runtime = new InitializationAgentRuntime(executor);

    const executedAgents: string[] = [];
    const stateTransitions: string[] = [];

    // Subscribe to monitor task completions and state store transitions
    runtime.subscribe((event) => {
      if (event.type === "INIT_TASK_COMPLETED" && event.taskType) {
        executedAgents.push(event.taskType);
      }
    });

    // Register handlers to track executor calls and verify dependency order
    executor.registerHandler("DISTRICT_MASTER", async (task, request, baseDir) => {
      executedAgents.push("HANDLER_DISTRICT_MASTER");
      stateTransitions.push("DISTRICT_MASTER_RESOLVED");
    });
    executor.registerHandler("AREA_GENERATION", async (task, request, baseDir) => {
      executedAgents.push("HANDLER_AREA_GENERATION");
    });
    executor.registerHandler("ELECTION_DATA", async (task, request, baseDir) => {
      executedAgents.push("HANDLER_ELECTION_DATA");
    });
    executor.registerHandler("DASHBOARD", async (task, request, baseDir) => {
      executedAgents.push("HANDLER_DASHBOARD");
    });
    executor.registerHandler("VISUALIZATION", async (task, request, baseDir) => {
      executedAgents.push("HANDLER_VISUALIZATION");
    });

    const request: InitializationRequest = {
      requestId: "req-init-001",
      districtId: "saitama-08",
      districtName: "埼玉県第8区",
      sourceHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2" // 64 char hex hash
    };

    const ledger = await runtime.execute(request, { baseDir: TEST_DIR });

    // Assert Scenario 2: Task Planning Check
    assert(ledger.tasks.length === 5, "Planned exactly 5 tasks.");
    const agentTypes = ledger.tasks.map(t => t.agentType);
    assert(agentTypes.includes("DISTRICT_MASTER"), "Planned district master task.");
    assert(agentTypes.includes("AREA_GENERATION"), "Planned area generation task.");
    assert(agentTypes.includes("ELECTION_DATA"), "Planned election data task.");
    assert(agentTypes.includes("DASHBOARD"), "Planned dashboard task.");
    assert(agentTypes.includes("VISUALIZATION"), "Planned visualization task.");

    // Assert Scenario 3: AI Employee Routing Integration Check
    assert(executedAgents.includes("HANDLER_DISTRICT_MASTER"), "Invoked DISTRICT_MASTER executor.");
    assert(executedAgents.includes("HANDLER_AREA_GENERATION"), "Invoked AREA_GENERATION executor.");
    assert(executedAgents.includes("HANDLER_ELECTION_DATA"), "Invoked ELECTION_DATA executor.");
    assert(executedAgents.includes("HANDLER_DASHBOARD"), "Invoked DASHBOARD executor.");
    assert(executedAgents.includes("HANDLER_VISUALIZATION"), "Invoked VISUALIZATION executor.");

    // Assert Step 1 is executed before others
    const firstHandler = executedAgents[0];
    assert(firstHandler === "HANDLER_DISTRICT_MASTER", "DISTRICT_MASTER executed first.");

    // Assert Scenario 4: Successful final state transition
    assert(ledger.state === "COMPLETED", "Final ledger state is COMPLETED.");
    assert(ledger.completedAt !== undefined, "completedAt time is registered.");
    assert(ledger.tasks.every(t => t.status === "COMPLETED"), "All tasks succeeded.");

    console.log("✅ Scenario 1-4 Passed.\n");
  }

  // Scenario 5: Replay Protection Blocking
  // ====================================================================
  {
    console.log("Scenario 5: Testing Replay Protection with duplicate requestId...");
    const executor = new InitializationExecutor();
    const runtime = new InitializationAgentRuntime(executor);

    executor.registerHandler("DISTRICT_MASTER", async () => {});
    executor.registerHandler("AREA_GENERATION", async () => {});
    executor.registerHandler("ELECTION_DATA", async () => {});
    executor.registerHandler("DASHBOARD", async () => {});
    executor.registerHandler("VISUALIZATION", async () => {});

    const request: InitializationRequest = {
      requestId: "req-init-dup-100",
      districtId: "saitama-08",
      districtName: "埼玉県第8区",
      sourceHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
    };

    // First execution succeeds
    await runtime.execute(request, { baseDir: TEST_DIR });

    // Second execution must throw error due to replay protection
    let didBlock = false;
    try {
      await runtime.execute(request, { baseDir: TEST_DIR });
    } catch (err: any) {
      didBlock = true;
      assert(err.message.includes("Replay Protection"), "Threw replay protection error.");
    }
    assert(didBlock, "Replay attack was blocked successfully.");

    console.log("✅ Scenario 5 Passed.\n");
  }

  // Scenario 6: Failure during execution (Unknown district or runner crash)
  // ====================================================================
  {
    console.log("Scenario 6: Testing failure path and state transition to FAILED...");
    const executor = new InitializationExecutor();
    const runtime = new InitializationAgentRuntime(executor);

    executor.registerHandler("DISTRICT_MASTER", async () => {});
    // Simulate failure in Area Master Generation (e.g. invalid layout or connection)
    executor.registerHandler("AREA_GENERATION", async () => {
      throw new Error("Area mapping failed: Target database offline.");
    });
    executor.registerHandler("ELECTION_DATA", async () => {});

    const request: InitializationRequest = {
      requestId: "req-init-fail-500",
      districtId: "saitama-08",
      districtName: "埼玉県第8区",
      sourceHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
    };

    let didCatchFail = false;
    try {
      await runtime.execute(request, { baseDir: TEST_DIR });
    } catch (err: any) {
      didCatchFail = true;
      assert(err.message.includes("Target database offline"), "Catches the correct task error.");
    }
    assert(didCatchFail, "Runtime execute threw error.");

    // Retrieve ledger history to inspect failed status
    const validator = runtime.getValidator();
    // Replay lock was created, but state was aborted
    assert(validator.validateRequest(request).errors.some(e => e.includes("Replay")), "Request ID is still locked.");

    console.log("✅ Scenario 6 Passed.\n");
  }

  console.log("🎉 All District Initialization Agent Integration Tests completed successfully!");
}

runTests().catch(err => {
  console.error("❌ Test execution failed:", err);
  process.exit(1);
});
