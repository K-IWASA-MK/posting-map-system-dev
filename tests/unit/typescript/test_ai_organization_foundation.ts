import assert from 'assert';
import {
  AIOrganizationManager,
  OrgHierarchyLevel,
  DelegationScope,
  AIOrganizationPolicyViolationException,
  UnauthorizedDelegationException
} from '../../../sdk/organization';

console.log("==================================================");
console.log("   AI ORGANIZATION FOUNDATION UNIT TEST SUITE");
console.log("==================================================");

async function runAIOrganizationFoundationTests() {
  // Test 1: 5-Level Hierarchy Creation (COMPANY -> DIVISION -> DEPARTMENT -> TEAM -> UNIT)
  console.log("\n[Test 1] 5-Level Hierarchy Creation Verification...");
  AIOrganizationManager.resetInstance();
  const manager = AIOrganizationManager.getInstance();

  const companyNode = manager.createNode('node-comp-001', 'POSTING MAP AI Enterprise', OrgHierarchyLevel.COMPANY);
  const divNode = manager.createNode('node-div-001', 'Field Operations Division', OrgHierarchyLevel.DIVISION, 'node-comp-001');
  const deptNode = manager.createNode('node-dept-001', 'Distribution Management Dept', OrgHierarchyLevel.DEPARTMENT, 'node-div-001');
  const teamNode = manager.createNode('node-team-001', 'Traffic Monitoring Team', OrgHierarchyLevel.TEAM, 'node-dept-001');
  const unitNode = manager.createNode('node-unit-001', 'Zone A Monitoring Unit', OrgHierarchyLevel.UNIT, 'node-team-001');

  assert.strictEqual(companyNode.level, OrgHierarchyLevel.COMPANY);
  assert.strictEqual(divNode.level, OrgHierarchyLevel.DIVISION);
  assert.strictEqual(deptNode.level, OrgHierarchyLevel.DEPARTMENT);
  assert.strictEqual(teamNode.level, OrgHierarchyLevel.TEAM);
  assert.strictEqual(unitNode.level, OrgHierarchyLevel.UNIT);
  console.log("   ✓ Test 1 Passed (All 5 hierarchy levels created successfully)");

  // Test 2: Member & Supervisor Assignment
  console.log("\n[Test 2] Member & Supervisor Assignment...");
  manager.assignSupervisor('node-team-001', 'emp-leader-001');
  manager.addMemberToNode('node-team-001', 'emp-traffic-001');
  manager.addMemberToNode('node-team-001', 'emp-weather-001');

  const team = manager['treeManager'].getNode('node-team-001');
  assert.strictEqual(team?.supervisorEmployeeId, 'emp-leader-001');
  assert.strictEqual(team?.memberEmployeeIds.length, 2);
  console.log("   ✓ Test 2 Passed (Supervisor and members assigned to Team node)");

  // Test 3: Delegation of Authority (DoA) & Verification
  console.log("\n[Test 3] Delegation of Authority (DoA) Grant & Verification...");
  manager.delegateAuthority('emp-leader-001', 'emp-traffic-001', DelegationScope.TASK);
  assert.strictEqual(manager.verifyAuthority('emp-leader-001', 'emp-traffic-001', DelegationScope.TASK), true);

  // Verifying ungranted scope throws UnauthorizedDelegationException
  assert.throws(
    () => manager.verifyAuthority('emp-leader-001', 'emp-traffic-001', DelegationScope.GLOBAL),
    UnauthorizedDelegationException,
    'Verifying ungranted DelegationScope must throw UnauthorizedDelegationException'
  );
  console.log("   ✓ Test 3 Passed (TASK DoA verified, ungranted GLOBAL DoA blocked)");

  // Test 4: Supervisor AI Intervention
  console.log("\n[Test 4] Supervisor AI Intervention...");
  const interveneSuccess = manager.intervene('emp-leader-001', 'emp-traffic-001', 'Pause execution due to weather alert');
  assert.strictEqual(interveneSuccess, true);
  assert.strictEqual(manager.getMetrics().interventionCount, 1);
  console.log("   ✓ Test 4 Passed (Supervisor AI successfully intervened on subordinate Agent)");

  // Test 5: Policy Team Size Enforcement
  console.log("\n[Test 5] AIOrganizationPolicy Team Size Limit...");
  for (let i = 2; i < 10; i++) {
    manager.addMemberToNode('node-team-001', `emp-worker-${i}`);
  }
  // Adding 11th member to MAX_TEAM_SIZE of 10 must fail
  assert.throws(
    () => manager.addMemberToNode('node-team-001', 'emp-worker-overflow'),
    AIOrganizationPolicyViolationException,
    'Exceeding MAX_TEAM_SIZE of 10 must throw AIOrganizationPolicyViolationException'
  );
  console.log("   ✓ Test 5 Passed (MAX_TEAM_SIZE limit enforced)");

  // Test 6: Organization Tree Recovery
  console.log("\n[Test 6] Full Enterprise Organization Tree Recovery...");
  const recoverySuccess = await manager.recover();
  assert.strictEqual(recoverySuccess, true);
  console.log("   ✓ Test 6 Passed (Organization tree restored successfully)");

  console.log("\n==================================================");
  console.log("   ALL AI ORGANIZATION FOUNDATION TESTS PASSED!");
  console.log("==================================================");
}

runAIOrganizationFoundationTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
