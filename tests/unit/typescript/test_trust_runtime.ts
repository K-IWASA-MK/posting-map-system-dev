import { TrustLevel } from '../../../core/trust-runtime/TrustLevel';
import { TrustScore } from '../../../core/trust-runtime/TrustScore';
import { ITrustMonitoringView } from '../../../core/trust-runtime/ITrustMonitoringView';
import { ISignatureVerifier } from '../../../core/trust-runtime/ISignatureVerifier';
import { SignatureVerifier } from '../../../core/trust-runtime/SignatureVerifier';
import { TrustEvaluator } from '../../../core/trust-runtime/TrustEvaluator';
import { TrustRuntimeVerifier } from '../../../core/trust-runtime/TrustRuntimeVerifier';
import { TrustValidationError } from '../../../core/trust-runtime/TrustRuntimeErrors';
import { PluginExecutionContext } from '../../../core/plugin-runtime/PluginExecutionContext';
import { WorkspaceContextBuilder } from '../../../core/workspace-runtime/WorkspaceContextBuilder';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// Mock monitoring view tracking metrics in variables
class MockMonitoringView implements ITrustMonitoringView {
  public denials = 0;
  public locksBlocked = 0;

  public getPermissionDenialsCount(pluginId: string): number {
    return this.denials;
  }

  public getWorkspaceLocksBlockedCount(projectId: string): number {
    return this.locksBlocked;
  }
}

// Helper to build a clean context structure
function buildMockContext(): PluginExecutionContext {
  const ws = WorkspaceContextBuilder.build('session-xyz', 'project-abc', '/mock/workspace');
  return {
    workspaceContext: ws,
    config: {
      pluginId: 'plugin-xyz',
      entryPoint: '/mock/entry.js',
      allowedPermissions: ['read_file']
    },
    requestedPermissions: ['read_file']
  };
}

// ==============================================================================
// Test 1: Successful Verification with 100 Score
// ==============================================================================
function testNormalVerification() {
  console.log('[Test 1] Normal verification starting...');
  const evaluator = new TrustEvaluator();
  const sigVerifier = new SignatureVerifier();
  const verifier = new TrustRuntimeVerifier(evaluator, sigVerifier);
  const monitoringView = new MockMonitoringView();

  const context = buildMockContext();
  const result = verifier.verify(context, monitoringView, 'valid-sig-123');

  assert(result.decision === 'allow', 'Should allow normal clean plugin');
  assert(result.evaluation.score.value === 100, 'Expected score of 100');
  assert(result.evaluation.score.level === 'trusted', 'Expected level of trusted');
  assert(result.evaluation.reasons.length === 0, 'Should have no penalties');

  console.log('[Test 1] Normal verification: PASSED');
}

// ==============================================================================
// Test 2: Trust Score Penalty Reduction to Sandboxed Level
// ==============================================================================
function testSandboxedPenalties() {
  console.log('[Test 2] Sandboxed penalties evaluation starting...');
  const evaluator = new TrustEvaluator();
  const sigVerifier = new SignatureVerifier();
  const verifier = new TrustRuntimeVerifier(evaluator, sigVerifier);
  const monitoringView = new MockMonitoringView();

  // Inject 1 denial (20 pts penalty) and 1 lock block (15 pts penalty)
  monitoringView.denials = 1;
  monitoringView.locksBlocked = 1;

  const context = buildMockContext();
  const result = verifier.verify(context, monitoringView, 'valid-sig-123');

  // Total score should be 100 - 20 - 15 = 65. level: 'sandboxed' (between 50 and 80)
  assert(result.decision === 'allow', 'Verifier should allow sandboxed level projects');
  assert(result.evaluation.score.value === 65, `Expected score of 65, got: ${result.evaluation.score.value}`);
  assert(result.evaluation.score.level === 'sandboxed', `Expected level of sandboxed, got: ${result.evaluation.score.level}`);
  assert(result.evaluation.reasons.length === 2, 'Expected 2 penalty reasons listed');

  console.log('[Test 2] Sandboxed penalties evaluation: PASSED');
}

// ==============================================================================
// Test 3: Untrusted Score Block (TRUST_SCORE_INSUFFICIENT)
// ==============================================================================
function testUntrustedBlock() {
  console.log('[Test 3] Untrusted block execution starting...');
  const evaluator = new TrustEvaluator();
  const sigVerifier = new SignatureVerifier();
  const verifier = new TrustRuntimeVerifier(evaluator, sigVerifier);
  const monitoringView = new MockMonitoringView();

  // Inject 3 denials (60 pts penalty). Total score 100 - 60 = 40. Level 'untrusted'
  monitoringView.denials = 3;

  const context = buildMockContext();
  let threwError = false;

  try {
    verifier.verify(context, monitoringView, 'valid-sig-123');
  } catch (err: any) {
    if (err instanceof TrustValidationError) {
      threwError = true;
      assert(err.errorCode === 'TRUST_SCORE_INSUFFICIENT', 'Expected TRUST_SCORE_INSUFFICIENT error code');
    }
  }

  assert(threwError, 'Verifier should throw exception for untrusted scores');
  console.log('[Test 3] Untrusted block execution: PASSED');
}

// ==============================================================================
// Test 4: Signature check fail (TRUST_SIGNATURE_INVALID)
// ==============================================================================
function testInvalidSignature() {
  console.log('[Test 4] Invalid signature check starting...');
  const evaluator = new TrustEvaluator();
  const sigVerifier = new SignatureVerifier();
  const verifier = new TrustRuntimeVerifier(evaluator, sigVerifier);
  const monitoringView = new MockMonitoringView();

  const context = buildMockContext();
  let threwError = false;

  try {
    verifier.verify(context, monitoringView, 'invalid-signature-value');
  } catch (err: any) {
    if (err instanceof TrustValidationError) {
      threwError = true;
      assert(err.errorCode === 'TRUST_SIGNATURE_INVALID', 'Expected TRUST_SIGNATURE_INVALID error code');
    }
  }

  assert(threwError, 'Verifier should block execution on invalid signature payload');
  console.log('[Test 4] Invalid signature check: PASSED');
}

// ==============================================================================
// Runner
// ==============================================================================
function runAllTests() {
  console.log('--- Starting Trust Runtime Foundation Unit Tests ---');
  testNormalVerification();
  testSandboxedPenalties();
  testUntrustedBlock();
  testInvalidSignature();
  console.log('--- All Trust Runtime Foundation Unit Tests PASSED ---');
}

try {
  runAllTests();
} catch (err) {
  console.error('[Test Suite Error]', err);
  process.exit(1);
}
