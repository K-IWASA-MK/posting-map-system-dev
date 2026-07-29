import assert from 'assert';
import { 
  LegacyDistributionAdapter, 
  LegacyAreaDetailsAdapter, 
  LegacyDashboardAdapter 
} from '../../../sdk/gateway/adapters/LegacyContractAdapter';
import { TaskContract } from '../../../sdk/gateway/models/TaskContractModels';
import { WorkflowProfile } from '../../../sdk/gateway/models/WorkflowProfile';

const DUMMY_WORKFLOW_PROFILE: WorkflowProfile = {
  workflowType: 'STANDARD_DEVELOPMENT',
  stages: [],
  outputPolicy: {
    language: 'ja',
    codeLanguage: 'en',
    documentationLanguage: 'ja'
  },
  completionPolicy: {
    requireVerification: false,
    requireGitCommit: false,
    requireGitPush: false,
    requireWalkthrough: false,
    requireHandover: false
  }
};

const DUMMY_OUTPUT_POLICY = {
  primaryLanguage: 'JA' as const,
  allowEnglishTechnicalTerms: true,
  rules: [],
  specificationVersion: '1.0'
};

function createMockContract(intent: any, metadata: any): TaskContract {
  return {
    taskId: 'TASK-1234',
    intent,
    workflowProfile: DUMMY_WORKFLOW_PROFILE,
    workflowStages: [],
    priority: 'NORMAL',
    status: 'CONTRACT_GENERATED',
    outputLanguage: 'JA',
    outputPolicy: DUMMY_OUTPUT_POLICY,
    createdAt: new Date().toISOString(),
    definitionOfDone: [],
    ceoDecision: {
      ceoInput: 'dummy',
      timestamp: new Date().toISOString(),
      metadata
    }
  };
}

async function testLegacyDistributionAdapter() {
  console.log('[Test 1] LegacyDistributionAdapter Verification...');
  const adapter = new LegacyDistributionAdapter();

  // Test supports()
  const validContract = createMockContract('IMPLEMENTATION', {
    legacyOperation: 'submitDistribution',
    legacySheetName: 'MIE-03',
    rowId: 10,
    areaId: 'AREA-001',
    staffName: 'Alice',
    count: 50,
    isDone: true,
    points: 100
  });

  assert(adapter.supports(validContract) === true, 'Adapter should support valid submitDistribution contract');

  const invalidIntentContract = createMockContract('RESEARCH', {
    legacyOperation: 'submitDistribution'
  });
  assert(adapter.supports(invalidIntentContract) === false, 'Adapter should reject invalid intent');

  // Test convert() success
  const dto = adapter.convert(validContract);
  assert(dto.legacySheetName === 'MIE-03', 'legacySheetName mismatch');
  assert(dto.rowId === 10, 'rowId mismatch');
  assert(dto.areaId === 'AREA-001', 'areaId mismatch');
  assert(dto.staffName === 'Alice', 'staffName mismatch');
  assert(dto.count === 50, 'count mismatch');
  assert(dto.isDone === true, 'isDone mismatch');
  assert(dto.points === 100, 'points mismatch');

  // Ensure Immutability
  assert(Object.isFrozen(dto), 'DTO must be frozen (Immutable)');

  // Test validation failures (Adapter Validation)
  const invalidMetadata1 = createMockContract('IMPLEMENTATION', {
    legacyOperation: 'submitDistribution',
    // missing legacySheetName
    rowId: 10,
    areaId: 'AREA-001',
    staffName: 'Alice',
    count: 50,
    isDone: true,
    points: 100
  });
  try {
    adapter.convert(invalidMetadata1);
    assert.fail('Should have thrown validation error for missing legacySheetName');
  } catch (e: any) {
    assert(e.message.includes('legacySheetName is missing'), 'Unexpected error message: ' + e.message);
  }

  const invalidMetadata2 = createMockContract('IMPLEMENTATION', {
    legacyOperation: 'submitDistribution',
    legacySheetName: 'MIE-03',
    rowId: -5, // rowId must be > 0
    areaId: 'AREA-001',
    staffName: 'Alice',
    count: 50,
    isDone: true,
    points: 100
  });
  try {
    adapter.convert(invalidMetadata2);
    assert.fail('Should have thrown validation error for invalid rowId');
  } catch (e: any) {
    assert(e.message.includes('rowId is missing or invalid'), 'Unexpected error message: ' + e.message);
  }

  // Ensure strict determinism
  const dto2 = adapter.convert(validContract);
  assert(JSON.stringify(dto) === JSON.stringify(dto2), 'Conversion must be strictly deterministic');

  console.log('   ✓ LegacyDistributionAdapter Verification: PASSED');
}

async function testLegacyAreaDetailsAdapter() {
  console.log('[Test 2] LegacyAreaDetailsAdapter Verification...');
  const adapter = new LegacyAreaDetailsAdapter();

  const validContract = createMockContract('RESEARCH', {
    legacyOperation: 'getAreaDetails',
    legacySheetName: 'MIE-03',
    areaId: 'AREA-001'
  });

  assert(adapter.supports(validContract) === true, 'Adapter should support getAreaDetails contract');
  
  const dto = adapter.convert(validContract);
  assert(dto.legacySheetName === 'MIE-03', 'legacySheetName mismatch');
  assert(dto.areaId === 'AREA-001', 'areaId mismatch');
  assert(Object.isFrozen(dto), 'DTO must be frozen (Immutable)');

  // Missing properties validation
  const invalidContract = createMockContract('RESEARCH', {
    legacyOperation: 'getAreaDetails',
    legacySheetName: 'MIE-03'
    // missing areaId
  });
  try {
    adapter.convert(invalidContract);
    assert.fail('Should throw error for missing areaId');
  } catch (e: any) {
    assert(e.message.includes('areaId is missing'), 'Unexpected error message: ' + e.message);
  }

  console.log('   ✓ LegacyAreaDetailsAdapter Verification: PASSED');
}

async function testLegacyDashboardAdapter() {
  console.log('[Test 3] LegacyDashboardAdapter Verification...');
  const adapter = new LegacyDashboardAdapter();

  const validContract = createMockContract('RESEARCH', {
    legacyOperation: 'getDashboardData',
    legacySheetName: 'MIE-03',
    dashboardType: 'summary'
  });

  assert(adapter.supports(validContract) === true, 'Adapter should support getDashboardData contract');
  
  const dto = adapter.convert(validContract);
  assert(dto.legacySheetName === 'MIE-03', 'legacySheetName mismatch');
  assert(dto.dashboardType === 'summary', 'dashboardType mismatch');
  assert(Object.isFrozen(dto), 'DTO must be frozen (Immutable)');

  console.log('   ✓ LegacyDashboardAdapter Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Legacy Contract Adapter Foundation Unit Tests ---');
  await testLegacyDistributionAdapter();
  await testLegacyAreaDetailsAdapter();
  await testLegacyDashboardAdapter();
  console.log('--- All Legacy Contract Adapter Foundation Unit Tests PASSED ---');
}

if (require.main === module) {
  runAll().catch(err => {
    console.error('Test Suite Error:', err);
    process.exit(1);
  });
}
