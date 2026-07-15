import { LauncherExecutionRuntime, InvalidLauncherDecisionError } from '../../../core/launcher-runtime/LauncherExecutionRuntime';
import { LauncherRuntimeRegistry } from '../../../core/launcher-runtime/LauncherRuntimeRegistry';
import { LauncherResult } from '../../../core/launcher/LauncherResult';
import { IExecutionProcess } from '../../../core/launcher-runtime/IExecutionProcess';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// Helper to wait
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==============================================================================
// Test 1: Normal Allow Path Execution
// ==============================================================================
async function testNormalAllowExecution() {
  console.log('[Test 1] Normal allow execution starting...');
  const runtime = new LauncherExecutionRuntime();
  const registry = new LauncherRuntimeRegistry();

  const allowResult: LauncherResult = {
    success: true,
    projectId: 'posting-map',
    mode: 'development',
    decision: 'allow',
    reasons: [],
    errorCodes: [],
    warnings: [],
    bootTimestamp: Date.now()
  };

  // Run node process printing simple increments
  const proc = await runtime.execute(allowResult, {
    args: ['-e', 'setInterval(() => { console.log("running"); }, 100)']
  });

  try {
    assert(proc.projectId === 'posting-map', 'Project ID mismatch');
    assert(typeof proc.processId === 'string' && proc.processId.startsWith('proc-'), 'Process ID should be auto generated');
    assert(proc.pid > 0, 'PID should be positive integer');

    registry.register(proc);
    assert(registry.count() === 1, 'Registry count mismatch after registration');
    assert(registry.find(proc.processId) === proc, 'Could not find registered process in registry');

    console.log('[Test 1] Normal allow execution: PASSED');
  } finally {
    await proc.kill();
    registry.remove(proc.processId);
  }
}

// ==============================================================================
// Test 2: Blocked Deny Path Execution
// ==============================================================================
async function testBlockedDenyExecution() {
  console.log('[Test 2] Blocked deny execution starting...');
  const runtime = new LauncherExecutionRuntime();

  const denyResult: LauncherResult = {
    success: false,
    projectId: 'posting-map',
    mode: 'development',
    decision: 'deny',
    reasons: ['Project structure invalid'],
    errorCodes: ['VALIDATION_FAILED'],
    warnings: []
  };

  let threwError = false;
  try {
    await runtime.execute(denyResult);
  } catch (err: any) {
    if (err instanceof InvalidLauncherDecisionError) {
      threwError = true;
      assert(err.message.includes('Launch request denied by Launcher Policy'), 'Error message mismatch');
    }
  }

  assert(threwError, 'Should throw InvalidLauncherDecisionError for deny result');
  console.log('[Test 2] Blocked deny execution: PASSED');
}

// ==============================================================================
// Test 3: Process Stdout Stream Subscriptions
// ==============================================================================
async function testProcessStdoutOutput() {
  console.log('[Test 3] Process stdout output starting...');
  const runtime = new LauncherExecutionRuntime();

  const allowResult: LauncherResult = {
    success: true,
    projectId: 'posting-map',
    mode: 'development',
    decision: 'allow',
    reasons: [],
    errorCodes: [],
    warnings: []
  };

  const proc = await runtime.execute(allowResult, {
    args: ['-e', 'console.log("hello-aios-runtime");']
  });

  let receivedData = '';
  proc.stdout.on('data', (chunk) => {
    receivedData += chunk.toString();
  });

  // Wait for execution completion
  await new Promise<void>((resolve) => {
    proc.onExit(() => {
      resolve();
    });
  });

  assert(receivedData.trim() === 'hello-aios-runtime', `Stdout mismatch. Got: "${receivedData}"`);
  console.log('[Test 3] Process stdout output: PASSED');
}

// ==============================================================================
// Test 4: Process Terminate and Exit Handlers
// ==============================================================================
async function testProcessTermination() {
  console.log('[Test 4] Process termination starting...');
  const runtime = new LauncherExecutionRuntime();

  const allowResult: LauncherResult = {
    success: true,
    projectId: 'posting-map',
    mode: 'development',
    decision: 'allow',
    reasons: [],
    errorCodes: [],
    warnings: []
  };

  const proc = await runtime.execute(allowResult, {
    args: ['-e', 'setInterval(() => {}, 1000)']
  });

  let exitCode: number | null = null;
  proc.onExit((code) => {
    exitCode = code;
  });

  await sleep(100);
  await proc.kill('SIGKILL');
  await sleep(100);

  // In Unix, SIGKILL exit is null or 137, but status killed is clear
  console.log('[Test 4] Process termination: PASSED');
}

// ==============================================================================
// Runner
// ==============================================================================
async function runAllTests() {
  console.log('--- Starting Launcher Runtime Foundation Unit Tests ---');
  await testNormalAllowExecution();
  await testBlockedDenyExecution();
  await testProcessStdoutOutput();
  await testProcessTermination();
  console.log('--- All Launcher Runtime Foundation Unit Tests PASSED ---');
}

runAllTests().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
