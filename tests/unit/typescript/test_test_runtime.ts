import { TestDiscovery } from '../../../tools/testing/TestDiscovery';
import { TestPolicy } from '../../../tools/testing/TestPolicy';
import { TestEnvironment } from '../../../tools/testing/TestEnvironment';
import { TestResult } from '../../../tools/testing/TestResult';
import * as path from 'path';
import * as fs from 'fs';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const MOCK_WORKSPACE_ROOT = path.join(__dirname, 'mock_workspace_test_runtime');

function setupMockWorkspace() {
  teardownMockWorkspace();
  fs.mkdirSync(MOCK_WORKSPACE_ROOT, { recursive: true });

  const tsDir = path.join(MOCK_WORKSPACE_ROOT, 'tests', 'unit', 'typescript');
  const pyDir = path.join(MOCK_WORKSPACE_ROOT, 'tests', 'unit', 'python');
  const simDir = path.join(MOCK_WORKSPACE_ROOT, 'tests', 'simulation');

  fs.mkdirSync(tsDir, { recursive: true });
  fs.mkdirSync(pyDir, { recursive: true });
  fs.mkdirSync(simDir, { recursive: true });

  fs.writeFileSync(path.join(tsDir, 'test_sample.ts'), 'console.log("ts");', 'utf-8');
  fs.writeFileSync(path.join(pyDir, 'test_sample.py'), 'print("py")', 'utf-8');
  fs.writeFileSync(path.join(simDir, 'ContractRegressionTest.js'), 'console.log("sim");', 'utf-8');
}

function teardownMockWorkspace() {
  if (fs.existsSync(MOCK_WORKSPACE_ROOT)) {
    fs.rmSync(MOCK_WORKSPACE_ROOT, { recursive: true, force: true });
  }
}

// ==============================================================================
// Test 1: TestDiscovery Scan
// ==============================================================================
function testDiscoveryScan() {
  console.log('[Test 1] TestDiscovery Scan starting...');
  setupMockWorkspace();
  try {
    const tsFiles = TestDiscovery.discoverTypeScriptTests(MOCK_WORKSPACE_ROOT);
    const pyFiles = TestDiscovery.discoverPythonTests(MOCK_WORKSPACE_ROOT);
    const simFiles = TestDiscovery.discoverSimulationTests(MOCK_WORKSPACE_ROOT);

    assert(tsFiles.length === 1, 'Should find 1 TypeScript test file');
    assert(tsFiles[0].endsWith('test_sample.ts'), 'Should find test_sample.ts');

    assert(pyFiles.length === 1, 'Should find 1 Python test file');
    assert(pyFiles[0].endsWith('test_sample.py'), 'Should find test_sample.py');

    assert(simFiles.length === 1, 'Should find 1 Simulation regression file');
    assert(simFiles[0].endsWith('ContractRegressionTest.js'), 'Should find ContractRegressionTest.js');

    console.log('[Test 1] TestDiscovery Scan: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 2: TestPolicy Outcomes
// ==============================================================================
function testPolicyOutcomes() {
  console.log('[Test 2] TestPolicy Outcomes starting...');

  // 1. Success Outcome
  const successResults: TestResult[] = [
    { suiteName: 'TS', success: true, passedCount: 5, failedCount: 0, skipped: false, errors: [] },
    { suiteName: 'Py', success: true, passedCount: 2, failedCount: 0, skipped: false, errors: [] }
  ];
  const summarySuccess = TestPolicy.evaluateSummary(successResults);
  assert(summarySuccess.success === true, 'Overall success should be true');
  assert(summarySuccess.decision === 'PASS', 'Decision should be PASS');
  assert(summarySuccess.totalPassed === 7, 'Passed count mismatch');
  assert(summarySuccess.totalFailed === 0, 'Failed count mismatch');

  // 2. Failure Outcome
  const failureResults: TestResult[] = [
    { suiteName: 'TS', success: true, passedCount: 5, failedCount: 0, skipped: false, errors: [] },
    { suiteName: 'Py', success: false, passedCount: 1, failedCount: 1, skipped: false, errors: ['Error message'] }
  ];
  const summaryFailure = TestPolicy.evaluateSummary(failureResults);
  assert(summaryFailure.success === false, 'Overall success should be false');
  assert(summaryFailure.decision === 'FAIL', 'Decision should be FAIL');
  assert(summaryFailure.totalPassed === 6, 'Passed count mismatch');
  assert(summaryFailure.totalFailed === 1, 'Failed count mismatch');

  // 3. Skip Outcome (Empty / Skipped)
  const skipResults: TestResult[] = [
    { suiteName: 'TS', success: true, passedCount: 0, failedCount: 0, skipped: true, errors: [] },
    { suiteName: 'Py', success: true, passedCount: 0, failedCount: 0, skipped: true, errors: [] }
  ];
  const summarySkip = TestPolicy.evaluateSummary(skipResults);
  assert(summarySkip.success === true, 'Overall success should be true for skips');
  assert(summarySkip.decision === 'SKIPPED', 'Decision should be SKIPPED');

  console.log('[Test 2] TestPolicy Outcomes: PASSED');
}

// ==============================================================================
// Test 3: TestEnvironment Discovery
// ==============================================================================
function testEnvironmentDiscovery() {
  console.log('[Test 3] TestEnvironment Discovery starting...');
  const currentRoot = path.resolve(__dirname, '../../..');
  const pythonCmdArgs = TestEnvironment.discoverPythonCommand(currentRoot);

  assert(pythonCmdArgs.length >= 1, 'Python command search should return executable command list');
  console.log(`[Test 3] Discovered python path command list: ${JSON.stringify(pythonCmdArgs)}`);

  console.log('[Test 3] TestEnvironment Discovery: PASSED');
}

// ==============================================================================
// Runner
// ==============================================================================
function runAllTests() {
  console.log('--- Starting Test Runtime Recovery Foundation Unit Tests ---');
  testDiscoveryScan();
  testPolicyOutcomes();
  testEnvironmentDiscovery();
  console.log('--- All Test Runtime Recovery Foundation Unit Tests PASSED ---');
}

runAllTests();
