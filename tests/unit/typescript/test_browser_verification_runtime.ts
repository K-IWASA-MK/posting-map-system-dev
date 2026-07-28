/**
 * test_browser_verification_runtime.ts
 * 
 * Browser Verification Runtime Unit Test Suite (Phase 4-A)
 */

import {
  BrowserVerificationActionType,
  BrowserVerificationRuntime,
  VerificationCapabilityFactory,
  VerificationCapabilityRegistry,
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from '../../../sdk/verification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testCapabilityGateCheck() {
  console.log('[Test] Capability Gate Check starting...');
  VerificationCapabilityRegistry.clear();

  const runtime = new BrowserVerificationRuntime();

  // Registry without BROWSER_AUTOMATION => status should be BLOCKED
  const blockedResult = await runtime.executeVerification({
    verificationId: 'req-01',
    targetUrl: 'http://localhost:8080/index.html',
    actions: [{ type: BrowserVerificationActionType.NAVIGATE }]
  });

  assert(blockedResult.status === 'BLOCKED', 'Should be BLOCKED when capability is missing');
  assert(Boolean(blockedResult.error && blockedResult.error.includes('Capability Execution Gate Blocked')), 'Error message should indicate gate block');

  // Register AVAILABLE BROWSER_AUTOMATION
  const cap = VerificationCapabilityFactory.createCapability({
    type: VerificationCapabilityType.BROWSER_AUTOMATION,
    status: VerificationCapabilityStatus.AVAILABLE
  });
  VerificationCapabilityRegistry.register(cap);

  const passResult = await runtime.executeVerification({
    verificationId: 'req-02',
    targetUrl: 'http://localhost:8080/index.html',
    actions: [
      { type: BrowserVerificationActionType.NAVIGATE },
      { type: BrowserVerificationActionType.SCREENSHOT },
      { type: BrowserVerificationActionType.DOM_SNAPSHOT }
    ]
  });

  assert(passResult.status === 'PASS', 'Should PASS when capability is AVAILABLE');
  assert(passResult.screenshotCount >= 1, 'Screenshot count should be >= 1');
  assert(passResult.domSnapshotLength > 0, 'DOM snapshot length should be > 0');

  console.log('   ✓ Capability Gate Check: PASSED');
}

async function testBrowserActionExecutionAndEvidence() {
  console.log('[Test] Browser Action Execution & Evidence collection starting...');
  VerificationCapabilityRegistry.clear();

  const cap = VerificationCapabilityFactory.createCapability({
    type: VerificationCapabilityType.BROWSER_AUTOMATION,
    status: VerificationCapabilityStatus.AVAILABLE
  });
  VerificationCapabilityRegistry.register(cap);

  const runtime = new BrowserVerificationRuntime();
  const result = await runtime.executeVerification({
    verificationId: 'req-actions-01',
    targetUrl: 'http://localhost:8080/app/index.html',
    actions: [
      { type: BrowserVerificationActionType.NAVIGATE, target: 'http://localhost:8080/app/index.html' },
      { type: BrowserVerificationActionType.INPUT, target: '#search', value: 'Tokyo' },
      { type: BrowserVerificationActionType.CLICK, target: '#submit' },
      { type: BrowserVerificationActionType.SCREENSHOT },
      { type: BrowserVerificationActionType.DOM_SNAPSHOT }
    ]
  });

  assert(result.status === 'PASS', 'Verification should PASS');
  assert(result.evidence.screenshots.length >= 1, 'Screenshots should be collected');
  assert(result.evidence.domSnapshot?.includes('Verified Page') === true, 'DOM snapshot should contain expected content');
  assert(result.evidence.consoleLogs.length > 0, 'Console logs should be captured');
  assert(result.evidence.networkLogs.length > 0, 'Network logs should be captured');

  console.log('   ✓ Browser Action Execution & Evidence collection: PASSED');
}

async function runAll() {
  console.log('--- Starting Browser Verification Runtime Unit Tests ---');
  await testCapabilityGateCheck();
  await testBrowserActionExecutionAndEvidence();
  console.log('--- All Browser Verification Runtime Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
