/**
 * test_ai_employee_profession_foundation.ts
 * 
 * TASK-AIOS-011: AI Employee Profession Foundation Comprehensive Test Suite
 */

import {
  ProfessionId,
  ProfessionCategory,
  EmployeeProfession,
  ProfessionRegistry,
  MissionId,
  EmployeeMission,
  MissionRegistry,
  DomainId,
  EmployeeDomain,
  DomainRegistry,
  SkillLevel,
  SkillProfile,
  SkillRegistry,
  ResponsibilityType,
  ResponsibilityMatrix,
  ResponsibilityResolver,
  ProfessionAssignment,
  ProfessionTemplate,
  ProfessionTemplateFactory,
  ProfessionResolver,
  ProfessionRoutingPolicy,
  ProfessionSelector,
  StandardProfessionCatalog,
  OrganizationBootstrap,
  EmployeeRole,
  EmployeeState,
  DepartmentId,
  EmployeeProvisioningService
} from '../../../sdk/employee';
import { BootstrapManager, AutonomousRuntimeState } from '../../../sdk/runtime';
import { AIEmployeeRegistry } from '../../../sdk/employee/manager/registry/AIEmployeeRegistry';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function resetEnvironment() {
  BootstrapManager.clear();
  EmployeeProvisioningService.clear();
  ProfessionRegistry.clear();
  MissionRegistry.clear();
  DomainRegistry.clear();
  SkillRegistry.clear();
}

// Test 1: Profession Model & Pure Registry
function test1_ProfessionModelAndRegistry() {
  console.log('[Test 1] Profession Model & Registry starting...');
  resetEnvironment();

  const prof: EmployeeProfession = {
    professionId: ProfessionId.of('ARCH_ENG'),
    title: 'Architecture Engineer',
    category: ProfessionCategory.ENGINEERING,
    description: 'Core architectural design'
  };

  ProfessionRegistry.register(prof);
  assert(ProfessionRegistry.getAll().length === 1, 'ProfessionRegistry should contain 1 profession');
  assert(ProfessionRegistry.find('ARCH_ENG')?.title === 'Architecture Engineer', 'Found profession title should match');
  assert(Boolean(ProfessionRegistry.remove('ARCH_ENG')), 'Remove profession should return true');
  assert(ProfessionRegistry.getAll().length === 0, 'ProfessionRegistry should be empty after remove');

  console.log('   ✓ Test 1: Profession Model & Registry: PASSED');
}

// Test 2: Mission Model with Definition of Done & Quality Criteria
function test2_MissionModelWithDoDAndQualityCriteria() {
  console.log('[Test 2] Mission Model with DoD & Quality Criteria starting...');
  resetEnvironment();

  const mission: EmployeeMission = {
    missionId: MissionId.of(MissionId.MISSION_VALIDATE_OUTPUT),
    title: 'Validate System Output',
    purpose: 'Ensure output governance and compliance',
    expectedDeliverable: 'Governance ALLOW Check Result',
    definitionOfDone: ['All tests PASS', 'Zero critical warnings', 'Supervisor approved'],
    qualityCriteria: ['Accuracy >= 99.9%']
  };

  MissionRegistry.register(mission);
  const found = MissionRegistry.find(MissionId.MISSION_VALIDATE_OUTPUT);
  assert(found !== undefined, 'Mission should be found');
  assert(found?.definitionOfDone.length === 3, 'DoD should contain 3 items');
  assert(found?.qualityCriteria[0] === 'Accuracy >= 99.9%', 'Quality criteria should match');

  console.log('   ✓ Test 2: Mission Model with DoD & Quality Criteria: PASSED');
}

// Test 3: Domain Model & Hierarchical Dot-Separated Matching
function test3_DomainModelAndHierarchicalMatching() {
  console.log('[Test 3] Domain Model & Hierarchical Matching starting...');
  resetEnvironment();

  const dCore = DomainId.of(DomainId.FIELD_OPS);
  assert(dCore.matches('FIELD_OPS'), 'Exact domain match should be true');
  assert(dCore.matches('FIELD_OPS.FIELD'), 'Hierarchical match (FIELD_OPS -> FIELD_OPS.FIELD) should be true');
  assert(dCore.matches('FIELD_OPS.GAS.V2_API'), 'Nested hierarchical match should be true');

  const dField = DomainId.of('FIELD_OPS.FIELD');
  assert(dField.matches('FIELD_OPS'), 'Reverse hierarchical match should be true');
  assert(!dField.matches('AIOS'), 'Unrelated domain match should be false');

  console.log('   ✓ Test 3: Domain Model & Hierarchical Matching: PASSED');
}

// Test 4: Skill Profile with Meta-fields
function test4_SkillProfileWithMetaFields() {
  console.log('[Test 4] Skill Profile with Meta-fields starting...');
  resetEnvironment();

  const skill: SkillProfile = {
    skillId: 'SKILL_TS',
    skillName: 'TypeScript Engineering',
    category: 'LANG',
    level: SkillLevel.EXPERT,
    confidence: 0.95,
    lastValidated: new Date().toISOString(),
    evidence: ['test_ai_employee_profession_foundation.ts']
  };

  SkillRegistry.register(skill);
  const found = SkillRegistry.find('SKILL_TS');
  assert(found !== undefined, 'Skill should be found');
  assert(found?.confidence === 0.95, 'Skill confidence should match');
  assert(found?.evidence?.length === 1, 'Evidence length should be 1');

  console.log('   ✓ Test 4: Skill Profile with Meta-fields: PASSED');
}

// Test 5: Responsibility Matrix & RACI Model
function test5_ResponsibilityMatrixAndRACIModel() {
  console.log('[Test 5] Responsibility Matrix & RACI Model starting...');
  resetEnvironment();

  const matrix: ResponsibilityMatrix = {
    professionId: 'IMPL_ENG',
    responsibilities: [
      { processName: 'CODE_IMPLEMENTATION', responsibilityType: ResponsibilityType.RESPONSIBLE },
      { processName: 'ARCHITECTURAL_APPROVAL', responsibilityType: ResponsibilityType.CONSULTED },
      { processName: 'RELEASE_APPROVAL', responsibilityType: ResponsibilityType.ACCOUNTABLE }
    ]
  };

  assert(ResponsibilityResolver.coversProcess(matrix, 'CODE_IMPLEMENTATION'), 'Should cover CODE_IMPLEMENTATION as RESPONSIBLE');
  assert(ResponsibilityResolver.coversProcess(matrix, 'RELEASE_APPROVAL'), 'Should cover RELEASE_APPROVAL as ACCOUNTABLE');
  assert(!ResponsibilityResolver.coversProcess(matrix, 'ARCHITECTURAL_APPROVAL', ResponsibilityType.RESPONSIBLE), 'Should not cover ARCHITECTURAL_APPROVAL as RESPONSIBLE');

  console.log('   ✓ Test 5: Responsibility Matrix & RACI Model: PASSED');
}

// Test 6: Profession Assignment & ProfessionTemplate
function test6_ProfessionAssignmentAndTemplate() {
  console.log('[Test 6] Profession Assignment & ProfessionTemplate starting...');
  resetEnvironment();

  const tpl = StandardProfessionCatalog.TEMPLATES.IMPL_ENG;
  const assignment = ProfessionTemplateFactory.createAssignmentFromTemplate(tpl, 'emp-dev-01');

  assert(assignment.employeeId === 'emp-dev-01', 'Assignment employeeId should match');
  assert(assignment.profession.professionId.getValue() === 'IMPL_ENG', 'Profession ID should match IMPL_ENG');
  assert(assignment.missions.length >= 1, 'Should contain default missions');
  assert(assignment.skills.length >= 1, 'Should contain default skills');

  const match = ProfessionResolver.evaluateMatch(assignment, {
    requiredProfessionId: 'IMPL_ENG',
    requiredMissionIds: [MissionId.MISSION_BUILD_RUNTIME]
  });

  assert(match.compositeScore > 0.8, `Composite score should be > 0.8, got ${match.compositeScore}`);

  console.log('   ✓ Test 6: Profession Assignment & ProfessionTemplate: PASSED');
}

// Test 7: Supervisor Profession Routing & Configurable Weights
function test7_SupervisorProfessionRoutingAndConfigurableWeights() {
  console.log('[Test 7] Supervisor Profession Routing & Configurable Weights starting...');
  resetEnvironment();

  const tplImpl = StandardProfessionCatalog.TEMPLATES.IMPL_ENG;
  const tplVal = StandardProfessionCatalog.TEMPLATES.VAL_SPEC;

  const candidateA = {
    profile: {
      identity: { employeeId: 'emp-dev-01', employeeName: 'Worker A', employeeType: 'AGENT' as const, version: '1.0', createdAt: '' },
      role: EmployeeRole.WORKER,
      departmentId: DepartmentId.DEVELOPMENT,
      capabilities: [],
      permissions: [],
      professionAssignment: ProfessionTemplateFactory.createAssignmentFromTemplate(tplImpl, 'emp-dev-01')
    },
    status: { employeeId: 'emp-dev-01', state: EmployeeState.IDLE, lastHeartbeat: '', load: 0.1 }
  };

  const candidateB = {
    profile: {
      identity: { employeeId: 'emp-val-01', employeeName: 'Worker B', employeeType: 'AGENT' as const, version: '1.0', createdAt: '' },
      role: EmployeeRole.WORKER,
      departmentId: DepartmentId.VALIDATION,
      capabilities: [],
      permissions: [],
      professionAssignment: ProfessionTemplateFactory.createAssignmentFromTemplate(tplVal, 'emp-val-01')
    },
    status: { employeeId: 'emp-val-01', state: EmployeeState.IDLE, lastHeartbeat: '', load: 0.1 }
  };

  const selector = new ProfessionSelector({ missionWeight: 0.5, domainWeight: 0.3, skillWeight: 0.1, loadWeight: 0.1 });
  const result = selector.selectOptimalWorker([candidateA, candidateB], {
    requiredMissionIds: [MissionId.MISSION_VALIDATE_OUTPUT]
  });

  assert(result !== null, 'Routing result should not be null');
  assert(result?.worker.profile.identity.employeeId === 'emp-val-01', 'Validation Worker B should be selected for VALIDATE_OUTPUT mission');

  console.log('   ✓ Test 7: Supervisor Profession Routing & Configurable Weights: PASSED');
}

// Test 8: Two-Layer Profession Catalog & Standard Profession Check
function test8_TwoLayerProfessionCatalog() {
  console.log('[Test 8] Two-Layer Profession Catalog starting...');
  resetEnvironment();

  assert(StandardProfessionCatalog.ARCHITECTURE_ENGINEER.professionId.getValue() === 'ARCH_ENG', 'System profession ARCH_ENG should exist');
  assert(StandardProfessionCatalog.FIELD_OPERATIONS_SPECIALIST.isCustomProjectProfession === true, 'Project profession FIELD_OPS_SPEC should have isCustomProjectProfession=true');

  console.log('   ✓ Test 8: Two-Layer Profession Catalog: PASSED');
}

// Test 9: Organization Integration & Role vs Profession Separation
function test9_OrganizationIntegrationAndRoleProfessionSeparation() {
  console.log('[Test 9] Organization Integration & Role vs Profession Separation starting...');
  resetEnvironment();

  const state = BootstrapManager.initialize();
  assert(state === AutonomousRuntimeState.READY, 'Bootstrap state should be READY');

  const profiles = EmployeeProvisioningService.getAllProfiles();
  assert(profiles.length >= 8, `Should have 8+ provisioned profiles, got ${profiles.length}`);

  const supervisorProfile = profiles.find((p) => p.role === EmployeeRole.SUPERVISOR);
  assert(supervisorProfile !== undefined, 'Supervisor profile should exist');
  assert(supervisorProfile?.role === EmployeeRole.SUPERVISOR, 'Role should be SUPERVISOR');
  assert(supervisorProfile?.professionAssignment?.profession.title === 'Architecture Engineer', 'Profession should be Architecture Engineer');

  const workerProfile = profiles.find((p) => p.departmentId === DepartmentId.DEVELOPMENT);
  assert(workerProfile !== undefined, 'Development worker profile should exist');
  assert(workerProfile?.role === EmployeeRole.SENIOR_WORKER || workerProfile?.role === EmployeeRole.WORKER, 'Role should be WORKER/SENIOR_WORKER');
  assert(workerProfile?.professionAssignment?.profession.title === 'Implementation Engineer', 'Profession should be Implementation Engineer');

  console.log('   ✓ Test 9: Organization Integration & Role vs Profession Separation: PASSED');
}

async function runAll() {
  console.log('========================================================');
  console.log('TASK-AIOS-011: AI Employee Profession Foundation Test Suite');
  console.log('========================================================');

  test1_ProfessionModelAndRegistry();
  test2_MissionModelWithDoDAndQualityCriteria();
  test3_DomainModelAndHierarchicalMatching();
  test4_SkillProfileWithMetaFields();
  test5_ResponsibilityMatrixAndRACIModel();
  test6_ProfessionAssignmentAndTemplate();
  test7_SupervisorProfessionRoutingAndConfigurableWeights();
  test8_TwoLayerProfessionCatalog();
  test9_OrganizationIntegrationAndRoleProfessionSeparation();

  console.log('========================================================');
  console.log('ALL AI EMPLOYEE PROFESSION FOUNDATION TESTS PASSED!');
  console.log('========================================================');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
