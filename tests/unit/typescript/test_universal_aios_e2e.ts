import { ProjectRegistry } from '../../../aios/projects/registry/ProjectRegistry';
import { ProjectDescriptor } from '../../../aios/projects/contracts/ProjectDescriptor';
import { ExecutiveController } from '../../../aios/orchestration/executive/ExecutiveController';
import { AgentRouter } from '../../../aios/orchestration/router/AgentRouter';
import { WorkforceExecutionEngine } from '../../../aios/execution/WorkforceExecutionEngine';
import { ReflectionEngine } from '../../../aios/learning/ReflectionEngine';
import { KnowledgeValidator } from '../../../aios/knowledge/KnowledgeValidator';
import { KnowledgeCandidate } from '../../../aios/knowledge/KnowledgeTypes';

function runTest(name: string, testFn: () => void | Promise<void>) {
  Promise.resolve(testFn()).then(() => {
    console.log(`[PASS] ${name}`);
  }).catch((error) => {
    console.error(`[FAIL] ${name}`);
    console.error(error);
    process.exit(1);
  });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// 1. Setup Mock ProjectRegistry
const registry = new ProjectRegistry();
const postingMapDescriptor: ProjectDescriptor = {
  manifest: {
    manifestVersion: "1.0",
    projectId: "posting-map",
    projectName: "Posting Map System",
    version: "1.0.0",
    description: "Field operations mapping and LINE integration",
    capabilities: ["GIS", "LIFF", "GAS"],
    runtimePolicy: {
      sandboxRequired: true,
      allowedPaths: ["./src", "./gas", "./config"],
      executionPermissions: ["read_file"]
    }
  },
  status: "ACTIVE",
  loadedAt: Date.now()
};
registry.register(postingMapDescriptor);

// 2. Setup AgentRouter & Workforce Pool
const router = new AgentRouter(registry);
router.registerEmployeeProfile({
  employeeId: "agent-liff-gas-specialist",
  capabilities: ["LIFF", "GAS"],
  governanceTrustScore: 0.95,
  domainExperiences: { "posting-map": 5 },
  taskHistories: ["Fix LIFF authentication issue"],
  totalTasksCompleted: 15,
  isAvailable: true
});

const executive = new ExecutiveController(registry);
const executionEngine = new WorkforceExecutionEngine();
const reflectionEngine = new ReflectionEngine();

async function mainTests() {
  // Case 1: Full E2E Pipeline (CEO Request -> Task -> Assignment -> Execution)
  await new Promise<void>((resolve, reject) => {
    runTest("Case 1: Full E2E Pipeline (CEO Request -> Executive -> Router -> Execution)", async () => {
      // Step A: CEO Request -> Executive
      const execResponse = executive.processRequest("ポスティングマップのLINE連携がおかしいから調べて");
      assert(execResponse.success, "Executive should resolve intent and create TaskRequest");
      assert(execResponse.decision.selectedProjectId === "posting-map", "Project should be posting-map");

      // Step B: TaskRequest -> Agent Router
      const assignmentContract = router.assignTask(execResponse.taskRequest!, execResponse.decision.riskLevel);
      assert(assignmentContract.employeeId === "agent-liff-gas-specialist", "Specialist agent should be assigned");

      // Step C: Assignment -> Ephemeral Sandbox Execution
      const execResult = executionEngine.executeTask(assignmentContract, (stepNumber) => {
        return {
          accessRequest: { path: "./src/liff/auth.ts" },
          outputSummary: `Verified LIFF auth component in step ${stepNumber}`
        };
      });

      assert(execResult.status === "COMPLETED", "Execution status must be COMPLETED");
      assert(execResult.stepResults.length > 0, "Execution steps should pass");
    });
    resolve();
  });

  // Case 2: Async Event-Driven Reflection Engine (4-stage Structured Reflection)
  await new Promise<void>((resolve, reject) => {
    runTest("Case 2: Async Event-Driven Reflection (Observation -> Cause -> Pattern -> Future Rule)", async () => {
      const execResponse = executive.processRequest("ポスティングマップのLINE連携がおかしいから調べて");
      const assignmentContract = router.assignTask(execResponse.taskRequest!, execResponse.decision.riskLevel);
      const execResult = executionEngine.executeTask(assignmentContract);

      // Async Event Listener Trigger
      const lesson = await reflectionEngine.onExecutionCompleted(execResult);

      assert(lesson !== undefined, "Reflection engine should produce a PersonalLesson");
      assert(Boolean(lesson.reflection.observation), "4-stage: Observation must exist");
      assert(Boolean(lesson.reflection.cause), "4-stage: Cause must exist");
      assert(Boolean(lesson.reflection.pattern), "4-stage: Pattern must exist");
      assert(Boolean(lesson.reflection.futureRule), "4-stage: Future Rule must exist");
    });
    resolve();
  });

  // Case 3: Agent Personal Memory & evidenceCount Update
  await new Promise<void>((resolve, reject) => {
    runTest("Case 3: Agent Personal Memory Update", async () => {
      const memory = reflectionEngine.getOrCreateMemory("agent-liff-gas-specialist");
      assert(memory.memoryVersion === 1, "memoryVersion should be 1");
      assert(memory.lessons.length > 0, "PersonalMemory should contain lessons");
      assert(memory.lessons[0].evidenceCount >= 1, "evidenceCount should be recorded");
    });
    resolve();
  });

  // Case 4: Multi-Tier Knowledge Promotion (KnowledgeValidator with Evidence Diversity)
  await new Promise<void>((resolve, reject) => {
    runTest("Case 4: Multi-Tier Knowledge Promotion Validation", () => {
      const candidateSingleTask: KnowledgeCandidate = {
        candidateId: "KCAN-SINGLE",
        targetScope: "PROJECT",
        projectId: "posting-map",
        ruleTitle: "Pre-verify AppScript execution quotas",
        reflection: {
          reflectionId: "R1", executionId: "E1", taskId: "T1", employeeId: "A1", projectId: "posting-map",
          observation: "O", cause: "C", pattern: "P", futureRule: "F", confidence: 0.90
        },
        evidenceTaskIds: ["TASK-001", "TASK-001", "TASK-001"], // Single task repeated 3 times (no diversity)
        evidenceCount: 3,
        confidence: 0.90,
        status: "PENDING_VALIDATION"
      };

      const resultSingle = KnowledgeValidator.evaluateCandidate(candidateSingleTask);
      assert(!resultSingle.approved, "Should NOT promote to Project Knowledge without evidence diversity");

      const candidateDiverseTask: KnowledgeCandidate = {
        ...candidateSingleTask,
        candidateId: "KCAN-DIVERSE",
        evidenceTaskIds: ["TASK-001", "TASK-002", "TASK-003"] // 3 diverse tasks
      };

      const resultDiverse = KnowledgeValidator.evaluateCandidate(candidateDiverseTask);
      assert(resultDiverse.approved, "Should promote to Project Knowledge with diverse evidence");
      assert(resultDiverse.targetScope === "PROJECT", "Target scope should be PROJECT");
    });
    resolve();
  });

  // Case 5: Memory Reuse Test (Context Injection)
  await new Promise<void>((resolve, reject) => {
    runTest("Case 5: Previous Knowledge Injection & Memory Reuse", async () => {
      const memory = reflectionEngine.getOrCreateMemory("agent-liff-gas-specialist");
      const latestLesson = memory.lessons[0];

      // Simulate passing memorySnapshotRef into promptContext for subsequent task
      const promptContext = {
        assignmentId: "ASG-NEXT",
        taskId: "TASK-NEXT",
        employeeId: "agent-liff-gas-specialist",
        projectId: "posting-map",
        taskObjective: "新規LINE連携エラーの調査",
        steps: [],
        allowedTools: ["read_file"],
        sandboxBoundaries: ["./src"],
        taskLedgerRef: "TL-PREV",
        memorySnapshotRef: latestLesson.lessonId // Injected memory snapshot reference
      };

      assert(promptContext.memorySnapshotRef === latestLesson.lessonId, "Previous memory snapshot reference should be injected into promptContext");
    });
    resolve();
  });

  console.log("\nAll Universal AIOS E2E Integration & Memory Evolution tests passed successfully.");
}

mainTests().catch(err => {
  console.error("E2E Test Execution Error:", err);
  process.exit(1);
});
