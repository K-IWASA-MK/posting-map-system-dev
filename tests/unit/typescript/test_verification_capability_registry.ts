/**
 * test_verification_capability_registry.ts
 * 
 * Verification Capability Registry Foundation Unit Test Suite
 */

import {
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

async function testRegistrationAndDuplicates() {
  console.log('[Test] Capability Registration & Duplicate Prevention starting...');
  VerificationCapabilityRegistry.clear();

  const cap1 = VerificationCapabilityFactory.createCapability({
    id: 'cap-cdp-01',
    type: VerificationCapabilityType.CDP_ENDPOINT,
    status: VerificationCapabilityStatus.UNTESTED,
    endpoint: 'http://localhost:9222/json/version'
  });

  const cap2 = VerificationCapabilityFactory.createCapability({
    id: 'cap-git-01',
    type: VerificationCapabilityType.GIT_ACCESS,
    status: VerificationCapabilityStatus.AVAILABLE
  });

  VerificationCapabilityRegistry.register(cap1);
  VerificationCapabilityRegistry.register(cap2);

  assert(VerificationCapabilityRegistry.getAll().length === 2, 'Registry should have 2 capabilities');

  // Duplicate ID registration error
  let duplicateError = false;
  try {
    VerificationCapabilityRegistry.register(cap1);
  } catch (err) {
    duplicateError = true;
  }
  assert(duplicateError, 'Registry should throw error on duplicate capability ID registration');

  console.log('   ✓ Capability Registration & Duplicate Prevention: PASSED');
}

async function testLookupAndInquiryAPIs() {
  console.log('[Test] Capability Lookup & Inquiry APIs starting...');
  VerificationCapabilityRegistry.clear();

  const cdpCap = VerificationCapabilityFactory.createCapability({
    id: 'cap-cdp-01',
    type: VerificationCapabilityType.CDP_ENDPOINT,
    status: VerificationCapabilityStatus.AVAILABLE,
    endpoint: 'http://localhost:9222/json/version'
  });

  const browserCap = VerificationCapabilityFactory.createCapability({
    id: 'cap-browser-01',
    type: VerificationCapabilityType.BROWSER_AUTOMATION,
    status: VerificationCapabilityStatus.AVAILABLE
  });

  const gitCap = VerificationCapabilityFactory.createCapability({
    id: 'cap-git-01',
    type: VerificationCapabilityType.GIT_ACCESS,
    status: VerificationCapabilityStatus.UNTESTED
  });

  VerificationCapabilityRegistry.registerMany([cdpCap, browserCap, gitCap]);

  // get
  const fetched = VerificationCapabilityRegistry.get('cap-cdp-01');
  assert(fetched !== undefined && fetched.id === 'cap-cdp-01', 'get() failed to retrieve capability');

  // getByType
  const cdpCaps = VerificationCapabilityRegistry.getByType(VerificationCapabilityType.CDP_ENDPOINT);
  assert(cdpCaps.length === 1 && cdpCaps[0].id === 'cap-cdp-01', 'getByType() failed');

  // getByStatus
  const untestedCaps = VerificationCapabilityRegistry.getByStatus(VerificationCapabilityStatus.UNTESTED);
  assert(untestedCaps.length === 1 && untestedCaps[0].id === 'cap-git-01', 'getByStatus() failed');

  // findAvailable
  const availableCaps = VerificationCapabilityRegistry.findAvailable();
  assert(availableCaps.length === 2, 'findAvailable() should return 2 AVAILABLE capabilities');

  const availableBrowser = VerificationCapabilityRegistry.findAvailable(VerificationCapabilityType.BROWSER_AUTOMATION);
  assert(availableBrowser.length === 1 && availableBrowser[0].id === 'cap-browser-01', 'findAvailable(type) failed');

  // hasCapability
  assert(VerificationCapabilityRegistry.hasCapability(VerificationCapabilityType.BROWSER_AUTOMATION), 'hasCapability should return true for AVAILABLE browser automation');
  assert(!VerificationCapabilityRegistry.hasCapability(VerificationCapabilityType.GIT_ACCESS, VerificationCapabilityStatus.AVAILABLE), 'hasCapability should return false for AVAILABLE git access');
  assert(VerificationCapabilityRegistry.hasCapability(VerificationCapabilityType.GIT_ACCESS, VerificationCapabilityStatus.UNTESTED), 'hasCapability should return true for UNTESTED git access');

  console.log('   ✓ Capability Lookup & Inquiry APIs: PASSED');
}

async function testUpdateStatusAndTimestamp() {
  console.log('[Test] Status Update & Timestamp Refresh starting...');
  VerificationCapabilityRegistry.clear();

  const originalCap = VerificationCapabilityFactory.createCapability({
    id: 'cap-cdp-01',
    type: VerificationCapabilityType.CDP_ENDPOINT,
    status: VerificationCapabilityStatus.UNTESTED,
    endpoint: 'http://localhost:9222/json/version',
    lastChecked: '2026-01-01T00:00:00.000Z'
  });

  VerificationCapabilityRegistry.register(originalCap);

  // Wait briefly or verify timestamp changes
  const updated = VerificationCapabilityRegistry.updateStatus(
    'cap-cdp-01',
    VerificationCapabilityStatus.AVAILABLE,
    { webSocketDebuggerUrl: 'ws://localhost:9222/devtools/browser/123' }
  );

  assert(updated.status === VerificationCapabilityStatus.AVAILABLE, 'Status failed to update to AVAILABLE');
  assert(updated.metadata?.webSocketDebuggerUrl === 'ws://localhost:9222/devtools/browser/123', 'Metadata update failed');
  assert(updated.lastChecked !== '2026-01-01T00:00:00.000Z', 'lastChecked timestamp must be automatically updated');

  const currentInRegistry = VerificationCapabilityRegistry.get('cap-cdp-01');
  assert(currentInRegistry?.status === VerificationCapabilityStatus.AVAILABLE, 'Updated state should be stored in registry');

  console.log('   ✓ Status Update & Timestamp Refresh: PASSED');
}

async function testSnapshotCaptureAndHistory() {
  console.log('[Test] Snapshot Capture & History tracking starting...');
  VerificationCapabilityRegistry.clear();

  assert(VerificationCapabilityRegistry.getLatestSnapshot() === undefined, 'Latest snapshot should initially be undefined');

  const cap1 = VerificationCapabilityFactory.createCapability({
    type: VerificationCapabilityType.BROWSER_AUTOMATION,
    status: VerificationCapabilityStatus.AVAILABLE
  });
  const cap2 = VerificationCapabilityFactory.createCapability({
    type: VerificationCapabilityType.CDP_ENDPOINT,
    status: VerificationCapabilityStatus.AVAILABLE
  });

  VerificationCapabilityRegistry.registerMany([cap1, cap2]);

  const snap1 = VerificationCapabilityRegistry.captureSnapshot();
  assert(snap1.overallStatus === 'READY', 'Initial snapshot should be READY');
  assert(VerificationCapabilityRegistry.getSnapshotHistory().length === 1, 'Snapshot history length should be 1');

  // Update a capability to UNAVAILABLE
  VerificationCapabilityRegistry.updateStatus(cap2.id, VerificationCapabilityStatus.UNAVAILABLE);
  const snap2 = VerificationCapabilityRegistry.captureSnapshot();
  assert(snap2.overallStatus === 'PARTIAL', 'Second snapshot should be PARTIAL');
  assert(VerificationCapabilityRegistry.getSnapshotHistory().length === 2, 'Snapshot history length should be 2');

  const latest = VerificationCapabilityRegistry.getLatestSnapshot();
  assert(latest?.snapshotId === snap2.snapshotId, 'getLatestSnapshot() should return latest captured snapshot');

  console.log('   ✓ Snapshot Capture & History tracking: PASSED');
}

async function testImmutableBoundary() {
  console.log('[Test] Immutable Boundary enforcement starting...');
  VerificationCapabilityRegistry.clear();

  const cap = VerificationCapabilityFactory.createCapability({
    id: 'cap-file-01',
    type: VerificationCapabilityType.FILE_ACCESS,
    status: VerificationCapabilityStatus.AVAILABLE
  });

  VerificationCapabilityRegistry.register(cap);

  const retrieved = VerificationCapabilityRegistry.get('cap-file-01');
  assert(retrieved !== undefined, 'Capability retrieved');

  let errorThrown = false;
  try {
    (retrieved as any).status = VerificationCapabilityStatus.DISABLED;
  } catch (err) {
    errorThrown = true;
  }
  assert(errorThrown || retrieved?.status === VerificationCapabilityStatus.AVAILABLE, 'Retrieved capability must be immutable');

  const allCaps = VerificationCapabilityRegistry.getAll();
  let arrayMutated = false;
  try {
    (allCaps as any).push(cap);
  } catch (err) {
    arrayMutated = true;
  }
  assert(arrayMutated || allCaps.length === 1, 'Returned arrays must be frozen');

  console.log('   ✓ Immutable Boundary enforcement: PASSED');
}

async function runAll() {
  console.log('--- Starting Verification Capability Registry Foundation Unit Tests ---');
  await testRegistrationAndDuplicates();
  await testLookupAndInquiryAPIs();
  await testUpdateStatusAndTimestamp();
  await testSnapshotCaptureAndHistory();
  await testImmutableBoundary();
  console.log('--- All Verification Capability Registry Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
