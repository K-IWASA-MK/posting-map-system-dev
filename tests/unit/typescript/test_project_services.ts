import { ProjectServiceRegistry } from '../../../core/project-services/ProjectServiceRegistry';
import { ProjectServiceState } from '../../../core/project-services/IProjectService';
import { LauncherService } from '../../../core/project-services/LauncherService';
import { DiagnosticsService } from '../../../core/project-services/DiagnosticsService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// ==============================================================================
// Test 1: Service Locator Registration & Lookup
// ==============================================================================
function testRegistrationAndLookup() {
  console.log('[Test 1] ProjectServiceRegistry registration and lookup starting...');
  
  ProjectServiceRegistry.clear();
  
  const launcher = new LauncherService();
  const diagnostics = new DiagnosticsService();

  ProjectServiceRegistry.register(launcher);
  ProjectServiceRegistry.register(diagnostics);

  const retrievedLauncher = ProjectServiceRegistry.lookup('launcher-service');
  assert(retrievedLauncher !== undefined, 'Launcher service must be registered');
  assert(retrievedLauncher?.serviceName === 'Project Launcher Service', 'Name mismatch');
  assert(retrievedLauncher?.version === '1.0.0', 'Version mismatch');

  const retrievedDiag = ProjectServiceRegistry.lookup('diagnostics-service');
  assert(retrievedDiag !== undefined, 'Diagnostics service must be registered');
  assert(retrievedDiag?.serviceName === 'Project Diagnostics Service', 'Name mismatch');

  // Attempt duplicate registration
  try {
    ProjectServiceRegistry.register(launcher);
    assert(false, 'Should have thrown error on duplicate registration');
  } catch (e: any) {
    assert(e.message.includes('already registered'), 'Error message mismatch');
  }

  console.log('[Test 1] ProjectServiceRegistry registration and lookup: PASSED');
}

// ==============================================================================
// Test 2: Lifecycle State Transitions Batch
// ==============================================================================
async function testLifecycleStateTransitions() {
  console.log('[Test 2] Service batch lifecycle state transitions starting...');

  ProjectServiceRegistry.clear();
  
  const launcher = new LauncherService();
  const diagnostics = new DiagnosticsService();

  assert(launcher.state === ProjectServiceState.Created, 'Initial state must be Created');
  assert(diagnostics.state === ProjectServiceState.Created, 'Initial state must be Created');

  ProjectServiceRegistry.register(launcher);
  ProjectServiceRegistry.register(diagnostics);

  // 1. Batch Initialize
  await ProjectServiceRegistry.initializeAll();
  
  assert(launcher.state === ProjectServiceState.Initialized, 'State should be Initialized');
  assert(diagnostics.state === ProjectServiceState.Initialized, 'State should be Initialized');

  // 2. Batch Shutdown
  await ProjectServiceRegistry.shutdownAll();

  assert(launcher.state === ProjectServiceState.Stopped, 'State should be Stopped');
  assert(diagnostics.state === ProjectServiceState.Stopped, 'State should be Stopped');

  console.log('[Test 2] Service batch lifecycle state transitions: PASSED');
}

// ==============================================================================
// Test 3: Diagnostics Skeleton Behavior
// ==============================================================================
function testDiagnosticsSkeleton() {
  console.log('[Test 3] DiagnosticsService skeleton behavior starting...');

  const diagnostics = new DiagnosticsService();
  
  try {
    diagnostics.diagnose('posting-map');
    assert(false, 'diagnose() should throw Not Implemented error');
  } catch (e: any) {
    assert(e.message.includes('not implemented'), 'Expected Not Implemented error message');
  }

  console.log('[Test 3] DiagnosticsService skeleton behavior: PASSED');
}

// ==============================================================================
// Runner
// ==============================================================================
async function runAllTests() {
  console.log('--- Starting Project Services Foundation Unit Tests ---');
  testRegistrationAndLookup();
  await testLifecycleStateTransitions();
  testDiagnosticsSkeleton();
  console.log('--- All Project Services Foundation Unit Tests PASSED ---');
}

runAllTests().catch((err) => {
  console.error('Unit tests failed with error:', err);
  process.exit(1);
});
