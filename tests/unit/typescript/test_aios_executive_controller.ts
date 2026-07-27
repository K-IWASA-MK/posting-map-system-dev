import { ProjectRegistry } from '../../../aios/projects/registry/ProjectRegistry';
import { ProjectDescriptor } from '../../../aios/projects/contracts/ProjectDescriptor';
import { ExecutiveController } from '../../../aios/orchestration/executive/ExecutiveController';
import { TaskLedger } from '../../../aios/orchestration/task/TaskLedger';

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

// Setup Mock ProjectRegistry with 2 projects: posting-map & 80s-disco
const registry = new ProjectRegistry();

const postingMapDescriptor: ProjectDescriptor = {
  manifest: {
    manifestVersion: "1.0",
    projectId: "posting-map",
    projectName: "Posting Map System",
    version: "1.0.0",
    description: "Field operations and GIS mapping system",
    capabilities: ["GIS", "LIFF", "GAS"],
    runtimePolicy: {
      sandboxRequired: true,
      allowedPaths: ["./src"],
      executionPermissions: ["read_file"]
    }
  },
  status: "ACTIVE",
  loadedAt: Date.now()
};

const discoDescriptor: ProjectDescriptor = {
  manifest: {
    manifestVersion: "1.0",
    projectId: "80s-disco",
    projectName: "80s Disco Media",
    version: "0.5.0",
    description: "Music curation and media database",
    capabilities: ["MEDIA_CURATION", "DATABASE"],
    runtimePolicy: {
      sandboxRequired: true,
      allowedPaths: ["./media"],
      executionPermissions: ["read_file"]
    }
  },
  status: "ACTIVE",
  loadedAt: Date.now()
};

registry.register(postingMapDescriptor);
registry.register(discoDescriptor);

const ledger = new TaskLedger();
const controller = new ExecutiveController(registry, ledger);

// Case 1: 明示 Project 指定
runTest("Case 1: Explicit Project Mention", () => {
  const response = controller.processRequest("POSTING MAPのLINE連携を調べて");
  assert(response.success, "Response should be successful for explicit project mention");
  assert(response.decision.selectedProjectId === "posting-map", "Selected projectId should be 'posting-map'");
  assert(response.decision.resolutionStatus === "RESOLVED", "Status should be RESOLVED");
  assert(response.taskRequest !== undefined, "TaskRequest should be generated");
  assert(response.taskRequest?.targetProjectId === "posting-map", "Target projectId in TaskRequest should match");
});

// Case 2: 曖昧依頼 (プロジェクト特定不能)
runTest("Case 2: Ambiguous Request", () => {
  const response = controller.processRequest("表示がおかしい");
  assert(!response.success, "Response should require clarification for ambiguous request");
  assert(Boolean(response.decision.resolutionStatus === "NEED_CLARIFICATION" || response.decision.resolutionStatus === "AMBIGUOUS"), "Status should indicate clarification needed");
  assert(response.clarificationRequest !== undefined, "ClarificationRequest should be generated");
  assert(Boolean(response.clarificationRequest?.question.includes("clarify")), "Clarification question should ask for project");
});

// Case 3: 高 Risk による Clarification 要求
runTest("Case 3: High Risk Clarification Request", () => {
  const response = controller.processRequest("posting-mapの引き継ぎデータを本番DBから削除して");
  assert(!response.success, "High risk request should not be automatically processed without confirmation");
  assert(response.decision.riskLevel === "HIGH", "Risk level should be detected as HIGH");
  assert(response.clarificationRequest !== undefined, "ClarificationRequest must be issued for HIGH risk");
  assert(response.clarificationRequest?.reason === "HIGH_RISK", "Reason should be HIGH_RISK");
});

// Case 4: Task 生成 & TaskLedger 記録
runTest("Case 4: Task Generation & TaskLedger Recording", () => {
  ledger.clear();
  const response = controller.processRequest("80s-discoの音楽データを参照して");
  assert(response.success, "Request should succeed");
  assert(response.taskRequest !== undefined, "TaskRequest should be generated");
  assert(response.ledgerEntry !== undefined, "TaskLedgerEntry should be generated");

  const recordedEntries = ledger.getByTaskId(response.taskRequest!.taskId);
  assert(recordedEntries.length === 1, "TaskLedger should contain exactly 1 entry for this taskId");
  assert(recordedEntries[0].selectedProjectId === "80s-disco", "Ledger entry should record target project '80s-disco'");
});

// Case 5: Reasoning 保存の検証
runTest("Case 5: Reasoning Factor Preservation", () => {
  const response = controller.processRequest("POSTING MAPのLINEを調べて");
  assert(response.decision.reasoning.length > 0, "Reasoning array should not be empty");

  const explicitMentionReason = response.decision.reasoning.find(r => r.factor === "EXPLICIT_MENTION");
  assert(explicitMentionReason !== undefined, "Reasoning should include EXPLICIT_MENTION factor");
  assert(explicitMentionReason?.value === "posting-map", "Factor value should match project ID");

  const capabilityReason = response.decision.reasoning.find(r => r.factor === "CAPABILITY_MATCH");
  assert(capabilityReason !== undefined, "Reasoning should include CAPABILITY_MATCH factor");
  assert(Boolean(capabilityReason?.reason && capabilityReason.reason.includes("LIFF")), "Reason text should mention capability");
});

console.log("\nAll AI Executive Controller unit tests passed successfully.");
