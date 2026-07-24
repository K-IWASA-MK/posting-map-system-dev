import assert from 'assert';
import {
  AITaskAssignmentManager,
  AITaskState,
  TaskPriority,
  AITaskManifest,
  TaskDependencyUnmetException,
  MaxHandoffExceededException
} from '../../../sdk/employee/assignment';

console.log("==================================================");
console.log("   AI EMPLOYEE ASSIGNMENT FOUNDATION UNIT TEST SUITE");
console.log("==================================================");

async function runAITaskAssignmentFoundationTests() {
  // Test 1: Task Identity & Manifest Registration
  console.log("\n[Test 1] Task Identity & Manifest Registration...");
  AITaskAssignmentManager.resetInstance();
  const manager = AITaskAssignmentManager.getInstance();

  const taskA: AITaskManifest = {
    identity: {
      taskId: 'task-init-001',
      taskType: 'DISTRICT_INITIALIZATION',
      createdAt: new Date().toISOString(),
      createdBy: 'CEO_IWASA',
      version: '1.0.0'
    },
    priority: TaskPriority.HIGH,
    ownerEmployeeId: 'emp-leader-001',
    requiredCapability: 'IMapCapability',
    dependsOnTaskIds: [],
    state: AITaskState.CREATED,
    payload: { districtId: 'MIE-03' },
    handoffCount: 0,
    reassignmentCount: 0
  };

  manager.registerTask(taskA);
  assert.strictEqual(manager.getTask('task-init-001')?.identity.taskId, 'task-init-001');
  console.log("   ✓ Test 1 Passed (Task identity registered into CREATED state)");

  // Test 2: Task Assignment Engine Execution & Owner/Current Separation
  console.log("\n[Test 2] Task Assignment Engine & Owner/Current Distinction...");
  const assignedEmp = manager.assignTask('task-init-001', ['emp-district-001', 'emp-traffic-001']);
  assert.strictEqual(assignedEmp, 'emp-district-001');
  
  const updatedTaskA = manager.getTask('task-init-001')!;
  assert.strictEqual(updatedTaskA.ownerEmployeeId, 'emp-leader-001');
  assert.strictEqual(updatedTaskA.currentEmployeeId, 'emp-district-001');
  assert.strictEqual(updatedTaskA.state, AITaskState.ASSIGNED);
  console.log("   ✓ Test 2 Passed (Task assigned to emp-district-001, owner remains emp-leader-001)");

  // Test 3: DAG Dependency Enforcement
  console.log("\n[Test 3] DAG Dependency Enforcement Test...");
  const taskB: AITaskManifest = {
    identity: {
      taskId: 'task-report-001',
      taskType: 'DISTRICT_REPORT',
      createdAt: new Date().toISOString(),
      createdBy: 'CEO_IWASA',
      version: '1.0.0'
    },
    priority: TaskPriority.NORMAL,
    ownerEmployeeId: 'emp-leader-001',
    requiredCapability: 'IMapCapability',
    dependsOnTaskIds: ['task-init-001'], // Depends on Task A being COMPLETED
    state: AITaskState.CREATED,
    payload: {},
    handoffCount: 0,
    reassignmentCount: 0
  };

  manager.registerTask(taskB);

  // Attempting to assign Task B before Task A is COMPLETED must fail
  assert.throws(
    () => manager.assignTask('task-report-001', ['emp-district-001']),
    TaskDependencyUnmetException,
    'Assigning task with unfulfilled DAG dependencies must throw TaskDependencyUnmetException'
  );

  // Complete Task A and verify Task B assignment succeeds
  updatedTaskA.state = AITaskState.COMPLETED;
  assert.doesNotThrow(() => manager.assignTask('task-report-001', ['emp-district-001']));
  console.log("   ✓ Test 3 Passed (DAG dependency enforced, unblocked after Task A COMPLETED)");

  // Test 4: Baton Relay Manager Handoff (TrafficAgent -> DistrictAgent)
  console.log("\n[Test 4] Baton Relay Structured Handoff...");
  const handoffSuccess = manager.handoffTask(
    updatedTaskA,
    'emp-district-001',
    'emp-traffic-001',
    { trafficStatus: 'CONGESTION_FREE' }
  );

  assert.strictEqual(handoffSuccess, true);
  assert.strictEqual(updatedTaskA.currentEmployeeId, 'emp-traffic-001');
  assert.strictEqual(updatedTaskA.handoffCount, 1);
  assert.strictEqual(updatedTaskA.payload.handoffPayload.trafficStatus, 'CONGESTION_FREE');
  console.log("   ✓ Test 4 Passed (Task handed off to emp-traffic-001 with context payload)");

  // Test 5: Assignment Recovery Manager (Re-assignment)
  console.log("\n[Test 5] Assignment Recovery & Re-assignment Sequence...");
  const recoverySuccess = manager.recoverTask(updatedTaskA, 'emp-fallback-001');
  assert.strictEqual(recoverySuccess, true);
  assert.strictEqual(updatedTaskA.currentEmployeeId, 'emp-fallback-001');
  assert.strictEqual(updatedTaskA.reassignmentCount, 1);
  console.log("   ✓ Test 5 Passed (Task recovered and re-assigned to fallback employee)");

  console.log("\n==================================================");
  console.log("   ALL AI EMPLOYEE ASSIGNMENT FOUNDATION TESTS PASSED!");
  console.log("==================================================");
}

runAITaskAssignmentFoundationTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
