/**
 * test_ai_employee_organization_foundation.ts
 * 
 * TASK-AIOS-010: AI Employee Organization Foundation Comprehensive Test Suite
 */

import {
  DepartmentId,
  EmployeeDepartment,
  EmployeeOrganization,
  OrganizationBlueprint,
  OrganizationRegistry,
  DepartmentRegistry,
  OrganizationBootstrap,
  EmployeeRole,
  RoleLevel,
  RoleHierarchy,
  RoleRegistry,
  EmployeeCapability,
  CapabilityAssignment,
  CapabilityResolver,
  EmployeePermission,
  PermissionResolver,
  EmployeeState,
  EmployeeProfile,
  EmployeeStatus,
  EmployeeFactory,
  EmployeeProvisioningService,
  SupervisorCommandType,
  SupervisorDirective,
  AssignmentEvaluation,
  WorkerAssignment,
  AssignmentPriority,
  CapabilityFirstStrategy,
  LoadBalancedStrategy,
  PriorityFirstStrategy,
  WorkerSelector,
  AssignmentPlanner,
  SupervisorRuntime
} from '../../../sdk/employee';
import { BootstrapManager, AutonomousRuntimeState } from '../../../sdk/runtime';
import { AIEmployeeRegistry } from '../../../sdk/employee/manager/registry/AIEmployeeRegistry';
import { ExecutionTaskRegistry } from '../../../sdk/execution';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function resetEnvironment() {
  BootstrapManager.clear();
  EmployeeProvisioningService.clear();
  OrganizationRegistry.clear();
  DepartmentRegistry.clear();
  RoleRegistry.clear();
  ExecutionTaskRegistry.clear();
}

// Test 1: Organization & Role Hierarchy Structure Test
function test1_OrganizationAndRoleStructure() {
  console.log('[Test 1] Organization & Role Structure starting...');
  resetEnvironment();

  assert(RoleLevel.getLevel(EmployeeRole.SUPERVISOR) === 50, 'Supervisor level should be 50');
  assert(RoleLevel.getLevel(EmployeeRole.WORKER) === 20, 'Worker level should be 20');

  assert(RoleHierarchy.canCommand(EmployeeRole.SUPERVISOR, EmployeeRole.WORKER), 'Supervisor should be able to command Worker');
  assert(!RoleHierarchy.canCommand(EmployeeRole.WORKER, EmployeeRole.SUPERVISOR), 'Worker should not be able to command Supervisor');
  assert(RoleHierarchy.isHigherRank(EmployeeRole.MANAGER, EmployeeRole.SENIOR_WORKER), 'Manager should be higher rank than Senior Worker');

  console.log('   ✓ Test 1: Organization & Role Structure: PASSED');
}

// Test 2: Capability Value Object & Match Score Test
function test2_CapabilityValueObjectAndMatchScore() {
  console.log('[Test 2] Capability Value Object & Match Score starting...');
  resetEnvironment();

  const capCode = EmployeeCapability.of('VERIFY.CODE', 'Code Verification', 'QUALITY');
  const capRuntime = EmployeeCapability.of('VERIFY.RUNTIME', 'Runtime Verification', 'QUALITY');

  assert(capCode.matches('VERIFY.CODE'), 'Exact match should be true');
  assert(capCode.matches('VERIFY'), 'Hierarchical prefix match should be true');
  assert(capCode.category === 'QUALITY', 'Category should be QUALITY');

  const employeeCaps = [EmployeeCapability.READ_CODE, capCode, EmployeeCapability.TEST];
  assert(CapabilityResolver.hasAllCapabilities(employeeCaps, ['READ_CODE', 'VERIFY.CODE']), 'Should have all capabilities');
  assert(!CapabilityResolver.hasAllCapabilities(employeeCaps, ['DEPLOY']), 'Should not have DEPLOY capability');

  const score = CapabilityResolver.calculateMatchScore(employeeCaps, ['READ_CODE', 'VERIFY', 'DEPLOY']);
  assert(Math.abs(score - (2 / 3)) < 0.01, `Match score should be 0.67, got ${score}`);

  console.log('   ✓ Test 2: Capability Value Object & Match Score: PASSED');
}

// Test 3: 3-Tier Permission Resolution Chain Test
function test3_ThreeTierPermissionResolutionChain() {
  console.log('[Test 3] 3-Tier Permission Resolution Chain starting...');
  resetEnvironment();

  // Tier 1 (Role) + Tier 2 (Dept: EXECUTIVE) + Tier 3 (Override)
  const context = {
    role: EmployeeRole.WORKER,
    departmentId: DepartmentId.EXECUTIVE,
    individualOverrides: [EmployeePermission.CAN_APPROVE]
  };

  const effective = PermissionResolver.resolveEffectivePermissions(context);
  assert(effective.has(EmployeePermission.CAN_EXECUTE), 'Worker should have CAN_EXECUTE from role');
  assert(effective.has(EmployeePermission.CAN_DEPROVISION), 'Executive department should grant CAN_DEPROVISION');
  assert(effective.has(EmployeePermission.CAN_APPROVE), 'Override should grant CAN_APPROVE');

  console.log('   ✓ Test 3: 3-Tier Permission Resolution Chain: PASSED');
}

// Test 4: Employee Provisioning (Profile Immutable & Status Mutable) Test
function test4_EmployeeProvisioningAndStateSeparation() {
  console.log('[Test 4] Employee Provisioning & State Separation starting...');
  resetEnvironment();

  const registry = new AIEmployeeRegistry();
  const { profile, status } = EmployeeProvisioningService.provisionEmployee(
    registry,
    'emp-test-01',
    'Test Provisioned Worker',
    EmployeeRole.WORKER,
    DepartmentId.DEVELOPMENT,
    [EmployeeCapability.WRITE_CODE]
  );

  assert(profile.identity.employeeId === 'emp-test-01', 'Profile ID should match');
  assert(status.state === EmployeeState.IDLE, 'Initial status state should be IDLE');
  assert(registry.getAllEmployees().length === 1, 'EmployeeRegistry should contain 1 employee');

  const updatedStatus = EmployeeProvisioningService.updateStatus('emp-test-01', { state: EmployeeState.RUNNING, load: 0.8 });
  assert(updatedStatus?.state === EmployeeState.RUNNING, 'Updated status should be RUNNING');
  assert(updatedStatus?.load === 0.8, 'Updated load should be 0.8');

  console.log('   ✓ Test 4: Employee Provisioning & State Separation: PASSED');
}

// Test 5: Worker Selection Strategies Test
function test5_WorkerSelectionStrategies() {
  console.log('[Test 5] Worker Selection Strategies starting...');
  resetEnvironment();

  const workerA = {
    profile: EmployeeFactory.createProfile('w-01', 'Worker A', EmployeeRole.WORKER, DepartmentId.DEVELOPMENT, [EmployeeCapability.READ_CODE, EmployeeCapability.WRITE_CODE]),
    status: EmployeeFactory.createInitialStatus('w-01')
  };
  workerA.status.load = 0.9; // High load

  const workerB = {
    profile: EmployeeFactory.createProfile('w-02', 'Worker B', EmployeeRole.WORKER, DepartmentId.DEVELOPMENT, [EmployeeCapability.READ_CODE]),
    status: EmployeeFactory.createInitialStatus('w-02')
  };
  workerB.status.load = 0.1; // Low load

  const capSelector = new WorkerSelector(new CapabilityFirstStrategy());
  const capResult = capSelector.selectOptimalWorker([workerA, workerB], ['READ_CODE', 'WRITE_CODE']);
  assert(capResult?.worker.profile.identity.employeeId === 'w-01', 'CapabilityFirstStrategy should select Worker A with higher capability match');

  const loadSelector = new WorkerSelector(new LoadBalancedStrategy());
  const loadResult = loadSelector.selectOptimalWorker([workerA, workerB], ['READ_CODE']);
  assert(loadResult?.worker.profile.identity.employeeId === 'w-02', 'LoadBalancedStrategy should select Worker B with lower load');

  console.log('   ✓ Test 5: Worker Selection Strategies: PASSED');
}

// Test 6: Supervisor Runtime & End-to-End Orchestration Test
function test6_SupervisorRuntimeOrchestration() {
  console.log('[Test 6] Supervisor Runtime & End-to-End Orchestration starting...');
  resetEnvironment();

  const sharedRegistry = new AIEmployeeRegistry();
  OrganizationBootstrap.bootstrap(sharedRegistry);

  const supervisorRuntime = new SupervisorRuntime('emp-supervisor-01');
  const assignment = supervisorRuntime.orchestrateAssignment('task-e2e-001', ['WRITE_CODE']);

  assert(assignment !== null && assignment !== undefined, 'Supervisor assignment should not be null');
  if (!assignment) return;
  assert(assignment.supervisorId === 'emp-supervisor-01', 'Supervisor ID should match');
  assert(assignment.workerId.includes('dev'), 'Assigned worker should be from development division');
  assert(assignment.directives.length === 1, 'Assignment should include 1 directive');
  assert(assignment.evaluation.matchScore === 1.0, 'Match score should be 1.0');

  console.log('   ✓ Test 6: Supervisor Runtime & End-to-End Orchestration: PASSED');
}

// Test 7: Pure Registries Enforcement Test
function test7_PureRegistriesEnforcement() {
  console.log('[Test 7] Pure Registries Enforcement starting...');
  resetEnvironment();

  OrganizationRegistry.register({
    organizationId: { getValue: () => 'org-01', equals: () => true } as any,
    companyName: 'Test Corp',
    departments: [],
    createdAt: new Date().toISOString()
  });

  assert(OrganizationRegistry.getAll().length === 1, 'OrganizationRegistry count should be 1');
  assert(OrganizationRegistry.find('org-01') !== undefined, 'Found org should not be undefined');
  assert(Boolean(OrganizationRegistry.remove('org-01')), 'Remove org should return true');
  assert(OrganizationRegistry.getAll().length === 0, 'OrganizationRegistry count should be 0 after remove');

  console.log('   ✓ Test 7: Pure Registries Enforcement: PASSED');
}

// Test 8: Organization Bootstrap & BootstrapManager Integration Test
function test8_OrganizationBootstrapAndManagerIntegration() {
  console.log('[Test 8] Organization Bootstrap & BootstrapManager Integration starting...');
  resetEnvironment();

  const state = BootstrapManager.initialize();
  assert(state === AutonomousRuntimeState.READY, 'Bootstrap state should be READY');

  const sharedReg = BootstrapManager.getSharedRegistry();
  const employees = sharedReg.getAllEmployees();
  assert(employees.length >= 8, `Shared AIEmployeeRegistry should contain 8+ employees, got ${employees.length}`);

  const profiles = EmployeeProvisioningService.getAllProfiles();
  assert(profiles.some((p) => p.role === EmployeeRole.SUPERVISOR), 'Should have provisioned Supervisor');
  assert(profiles.some((p) => p.departmentId === DepartmentId.RESEARCH), 'Should have provisioned Research worker');
  assert(profiles.some((p) => p.departmentId === DepartmentId.VALIDATION), 'Should have provisioned Validation worker');
  assert(profiles.some((p) => p.departmentId === DepartmentId.DEVELOPMENT), 'Should have provisioned Development worker');
  assert(profiles.some((p) => p.departmentId === DepartmentId.DEPLOYMENT), 'Should have provisioned Deployment worker');

  console.log('   ✓ Test 8: Organization Bootstrap & BootstrapManager Integration: PASSED');
}

async function runAll() {
  console.log('========================================================');
  console.log('TASK-AIOS-010: AI Employee Organization Foundation Test Suite');
  console.log('========================================================');

  test1_OrganizationAndRoleStructure();
  test2_CapabilityValueObjectAndMatchScore();
  test3_ThreeTierPermissionResolutionChain();
  test4_EmployeeProvisioningAndStateSeparation();
  test5_WorkerSelectionStrategies();
  test6_SupervisorRuntimeOrchestration();
  test7_PureRegistriesEnforcement();
  test8_OrganizationBootstrapAndManagerIntegration();

  console.log('========================================================');
  console.log('ALL AI EMPLOYEE ORGANIZATION FOUNDATION TESTS PASSED!');
  console.log('========================================================');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
