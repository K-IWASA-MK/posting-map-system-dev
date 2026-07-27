import { ProjectDescriptor } from '../../../aios/projects/contracts/ProjectDescriptor';
import { TaskRequest } from '../../../aios/orchestration/task/TaskTypes';
import { AIAssignmentContract } from '../../../aios/workforce/AIAssignmentContract';
import { WorkforceExecutionEngine } from '../../../aios/execution/WorkforceExecutionEngine';
import { ExecutionLedgerAdapter } from '../../../aios/execution/ExecutionLedgerAdapter';

function runTest(name: string, testFn: () => void) {
  try {
    testFn();
    console.log(`[PASS] ${name}`);
  } catch (error) {
    console.error(`[FAIL] ${name}`);
    console.error(error);
    process.exit(1);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Setup Mock ProjectDescriptor and TaskRequest
const mockProjectDescriptor: ProjectDescriptor = {
  manifest: {
    manifestVersion: "1.0",
    projectId: "posting-map",
    projectName: "Posting Map System",
    version: "1.0.0",
    description: "Field operations mapping",
    capabilities: ["GIS", "LIFF"],
    runtimePolicy: {
      sandboxRequired: true,
      allowedPaths: ["./src", "./config"],
      executionPermissions: ["read_file", "execute_command"]
    }
  },
  status: "ACTIVE",
  loadedAt: Date.now()
};

const mockTaskRequest: TaskRequest = {
  taskId: "TASK-EXEC-001",
  requester: "CEO",
  rawIntent: "ポスティングマップの仕様確認",
  targetProjectId: "posting-map",
  requiredCapabilities: ["GIS"],
  priority: "LOW",
  steps: [
    { stepNumber: 1, title: "Check Config", description: "Inspect config", requiredCapability: "GIS" },
    { stepNumber: 2, title: "Verify Source", description: "Inspect src", requiredCapability: "GIS" }
  ],
  status: "PLAN_CREATED",
  createdAt: Date.now()
};

const mockAssignmentContract: AIAssignmentContract = {
  assignmentId: "ASG-EXEC-001",
  taskId: "TASK-EXEC-001",
  employeeId: "agent-spatial-senior",
  targetProjectId: "posting-map",
  taskRequest: mockTaskRequest,
  projectManifest: mockProjectDescriptor.manifest,
  runtimePolicy: mockProjectDescriptor.manifest.runtimePolicy,
  decisionRecord: {
    decisionId: "DEC-001",
    taskId: "TASK-EXEC-001",
    selectedEmployeeId: "agent-spatial-senior",
    selectedScore: 0.95,
    rejectedCandidates: [],
    appliedPolicy: "LOW_RISK_GROWTH_FIRST",
    timestamp: Date.now()
  },
  assignedAt: Date.now()
};

// Case 1: 正常タスク実行セッション (1 Task = 1 Runtime)
runTest("Case 1: Ephemeral Task Execution Session", () => {
  const engine = new WorkforceExecutionEngine();
  const result = engine.executeTask(mockAssignmentContract);

  assert(result.status === "COMPLETED", "Overall status should be COMPLETED");
  assert(result.stepResults.length === 2, "All 2 steps should be executed");
  assert(Boolean(result.executionContextHash), "executionContextHash should be generated");
});

// Case 2: サンドボックス境界制御・アクセス許可
runTest("Case 2: Sandbox Allowed Path Access", () => {
  const engine = new WorkforceExecutionEngine();
  const result = engine.executeTask(mockAssignmentContract, (stepNumber) => {
    return {
      accessRequest: { path: "./src/platform/code.ts" },
      outputSummary: `Allowed access to ./src for step ${stepNumber}`
    };
  });

  assert(result.status === "COMPLETED", "Task should complete successfully for allowed path");
  assert(result.violationsCount === 0, "Violations count should be 0");
});

// Case 3: HIGH Risk タスクにおける即時停止 (Immediate Halt)
runTest("Case 3: High Risk Sandbox Immediate Halt", () => {
  const highRiskTaskContract: AIAssignmentContract = {
    ...mockAssignmentContract,
    taskRequest: {
      ...mockTaskRequest,
      priority: "HIGH"
    }
  };

  const engine = new WorkforceExecutionEngine();
  const result = engine.executeTask(highRiskTaskContract, () => {
    return {
      accessRequest: { path: "../etc/passwd" }, // Path traversal violation
      outputSummary: "Attempted unauthorized access"
    };
  });

  assert(result.status === "INTERCEPTED", "Status should be INTERCEPTED for HIGH risk violation");
  assert(result.events.some(e => e.eventType === "SANDBOX_VIOLATION"), "SANDBOX_VIOLATION event should be logged");
  assert(result.events.some(e => e.eventType === "FAILED"), "FAILED event should be logged");
});

// Case 4: LOW Risk タスクにおける 1回警告リトライ (Warning Retry)
runTest("Case 4: Low Risk Sandbox Warning Retry", () => {
  let attemptCount = 0;
  const engine = new WorkforceExecutionEngine();

  const result = engine.executeTask(mockAssignmentContract, (stepNumber) => {
    attemptCount++;
    if (attemptCount === 1) {
      return {
        accessRequest: { path: "./unauthorized_dir/secret.txt" }, // First attempt invalid
        outputSummary: "First invalid attempt"
      };
    }
    return {
      accessRequest: { path: "./src/valid.ts" }, // Second attempt valid
      outputSummary: "Corrected path attempt"
    };
  });

  assert(result.events.some(e => e.eventType === "SANDBOX_VIOLATION"), "SANDBOX_VIOLATION event should be recorded");
  assert(result.events.some(e => e.eventType === "RETRY"), "RETRY event should be recorded");
  assert(result.status === "COMPLETED", "Task should complete after successful retry");
});

// Case 5: ExecutionEvent ストリーム & executionContextHash 検証
runTest("Case 5: Event Stream Logging & Context Hash Verification", () => {
  const adapter = new ExecutionLedgerAdapter();
  const engine = new WorkforceExecutionEngine(adapter);
  const result = engine.executeTask(mockAssignmentContract);

  const events = adapter.getEvents(result.executionId);
  assert(events.length >= 3, "Event stream should record STARTED, STEP_COMPLETED, and COMPLETED events");
  assert(events[0].eventType === "STARTED", "First event should be STARTED");
  assert(events[events.length - 1].eventType === "COMPLETED", "Last event should be COMPLETED");

  const expectedHash = ExecutionLedgerAdapter.generateContextHash(mockAssignmentContract);
  assert(result.executionContextHash === expectedHash, "ExecutionContextHash in result must match generated hash");
});

console.log("\nAll WorkforceExecutionEngine tests passed successfully.");
