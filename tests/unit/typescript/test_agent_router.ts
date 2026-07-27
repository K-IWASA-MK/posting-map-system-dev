import { ProjectRegistry } from '../../../aios/projects/registry/ProjectRegistry';
import { ProjectDescriptor } from '../../../aios/projects/contracts/ProjectDescriptor';
import { TaskRequest } from '../../../aios/orchestration/task/TaskTypes';
import { AgentRouter } from '../../../aios/orchestration/router/AgentRouter';
import { EmployeeProfileMock } from '../../../aios/orchestration/router/AgentScoreEngine';

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

// Setup Mock ProjectRegistry
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

registry.register(postingMapDescriptor);

// Setup Mock Employees
const seniorGisAgent: EmployeeProfileMock = {
  employeeId: "agent-spatial-senior",
  capabilities: ["GIS", "BOUNDARY"],
  governanceTrustScore: 0.98,
  domainExperiences: { "posting-map": 15 },
  taskHistories: ["GIS boundary check"],
  totalTasksCompleted: 45,
  isAvailable: true
};

const similaritySpecialistAgent: EmployeeProfileMock = {
  employeeId: "agent-liff-specialist",
  capabilities: ["LIFF", "GAS"],
  governanceTrustScore: 0.80,
  domainExperiences: { "posting-map": 2 },
  taskHistories: ["Fix LIFF authentication issue on iPhone"],
  totalTasksCompleted: 10,
  isAvailable: true
};

const juniorGisAgent: EmployeeProfileMock = {
  employeeId: "agent-spatial-junior",
  capabilities: ["GIS", "BOUNDARY"],
  governanceTrustScore: 0.98, // Same trust as senior
  domainExperiences: { "posting-map": 0 },
  taskHistories: [],
  totalTasksCompleted: 2, // Less experience (Growth candidate)
  isAvailable: true
};

// Case 1: 正常スキルマッチ & アサイン
runTest("Case 1: Normal Capability Matching", () => {
  const router = new AgentRouter(registry);
  router.registerEmployeeProfile(seniorGisAgent);
  router.registerEmployeeProfile(similaritySpecialistAgent);

  const task: TaskRequest = {
    taskId: "TASK-001",
    requester: "CEO",
    rawIntent: "ポスティングマップの境界チェックをして",
    targetProjectId: "posting-map",
    requiredCapabilities: ["GIS"],
    priority: "NORMAL",
    steps: [],
    status: "PLAN_CREATED",
    createdAt: Date.now()
  };

  const contract = router.assignTask(task, "LOW");
  assert(contract.employeeId === "agent-spatial-senior", "Senior GIS agent should be assigned for GIS task");
  assert(contract.targetProjectId === "posting-map", "Project ID must match target");
});

// Case 2: タスク類似度 (historicalTaskSimilarityScore) による評価選定
runTest("Case 2: Historical Task Similarity Scoring", () => {
  const router = new AgentRouter(registry);
  router.registerEmployeeProfile(seniorGisAgent);
  router.registerEmployeeProfile(similaritySpecialistAgent);

  const task: TaskRequest = {
    taskId: "TASK-002",
    requester: "CEO",
    rawIntent: "LIFFのログイン認証エラーを調査して",
    targetProjectId: "posting-map",
    requiredCapabilities: ["LIFF"],
    priority: "NORMAL",
    steps: [],
    status: "PLAN_CREATED",
    createdAt: Date.now()
  };

  const contract = router.assignTask(task, "MEDIUM");
  assert(contract.employeeId === "agent-liff-specialist", "LIFF specialist should be selected due to high similarity score");
});

// Case 3: HIGH Risk タスクでの Trust 優先選定
runTest("Case 3: High Risk Trust-First Selection", () => {
  const router = new AgentRouter(registry);
  router.registerEmployeeProfile(seniorGisAgent);
  router.registerEmployeeProfile(juniorGisAgent);

  const task: TaskRequest = {
    taskId: "TASK-003",
    requester: "CEO",
    rawIntent: "ポスティングマップの本番境界データを変更して",
    targetProjectId: "posting-map",
    requiredCapabilities: ["GIS"],
    priority: "HIGH",
    steps: [],
    status: "PLAN_CREATED",
    createdAt: Date.now()
  };

  const contract = router.assignTask(task, "HIGH");
  assert(contract.employeeId === "agent-spatial-senior", "Senior agent with higher domain exp should be selected under HIGH risk");
  assert(contract.decisionRecord.appliedPolicy.includes("HIGH_RISK"), "Applied policy should indicate HIGH_RISK");
});

// Case 4: LOW Risk タスクにおける同点時の Growth 優先タイブレーカー
runTest("Case 4: Low Risk Growth Tie-Breaker", () => {
  const router = new AgentRouter(registry);
  router.registerEmployeeProfile(seniorGisAgent);
  router.registerEmployeeProfile(juniorGisAgent);

  const task: TaskRequest = {
    taskId: "TASK-004",
    requester: "CEO",
    rawIntent: "ポスティングマップのGIS仕様書を整理して",
    targetProjectId: "posting-map",
    requiredCapabilities: ["GIS"],
    priority: "LOW",
    steps: [],
    status: "PLAN_CREATED",
    createdAt: Date.now()
  };

  const contract = router.assignTask(task, "LOW");
  assert(contract.employeeId === "agent-spatial-junior", "Junior agent should be selected for LOW risk task under Growth tie-breaker policy");
  assert(contract.decisionRecord.appliedPolicy.includes("LOW_RISK_GROWTH"), "Applied policy should indicate LOW_RISK_GROWTH");
});

// Case 5: AssignmentDecisionRecord の保存検証
runTest("Case 5: Decision Record Preservation", () => {
  const router = new AgentRouter(registry);
  router.registerEmployeeProfile(seniorGisAgent);
  router.registerEmployeeProfile(similaritySpecialistAgent);

  const task: TaskRequest = {
    taskId: "TASK-005",
    requester: "CEO",
    rawIntent: "ポスティングマップの境界チェックをして",
    targetProjectId: "posting-map",
    requiredCapabilities: ["GIS"],
    priority: "NORMAL",
    steps: [],
    status: "PLAN_CREATED",
    createdAt: Date.now()
  };

  const contract = router.assignTask(task, "LOW");
  const record = contract.decisionRecord;

  assert(record !== undefined, "DecisionRecord must exist in contract");
  assert(record.taskId === "TASK-005", "Record taskId must match");
  assert(record.selectedEmployeeId === "agent-spatial-senior", "Selected employee ID must match");
  assert(record.rejectedCandidates.length === 1, "There should be 1 rejected candidate");
  assert(record.rejectedCandidates[0].employeeId === "agent-liff-specialist", "Rejected candidate should be agent-liff-specialist");
  assert(Boolean(record.rejectedCandidates[0].reason), "Rejection reason must be stated");
});

console.log("\nAll AgentRouter and Dynamic Workforce Assignment tests passed successfully.");
