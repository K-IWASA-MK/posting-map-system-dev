/**
 * test_verification_capability_foundation.ts
 * 
 * Verification Capability Model Foundation Unit Test Suite
 */

import {
  VerificationCapabilityFactory,
  VerificationCapabilityStatus,
  VerificationCapabilityType,
  VerificationCapabilityValidator
} from '../../../sdk/verification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testCapabilityCreationAndValidation() {
  console.log('[Test] Capability Creation & Validation starting...');

  const cap = VerificationCapabilityFactory.createCapability({
    id: 'cap-cdp-01',
    type: VerificationCapabilityType.CDP_ENDPOINT,
    status: VerificationCapabilityStatus.AVAILABLE,
    endpoint: 'http://localhost:9222/json/version',
    permission: 'READ_WRITE',
    metadata: { browser: 'Chrome', version: '126.0.0' }
  });

  assert(cap.id === 'cap-cdp-01', 'ID mismatch');
  assert(cap.type === VerificationCapabilityType.CDP_ENDPOINT, 'Type mismatch');
  assert(cap.status === VerificationCapabilityStatus.AVAILABLE, 'Status mismatch');
  assert(cap.endpoint === 'http://localhost:9222/json/version', 'Endpoint mismatch');
  assert(cap.permission === 'READ_WRITE', 'Permission mismatch');
  assert(cap.metadata?.browser === 'Chrome', 'Metadata browser mismatch');
  assert(VerificationCapabilityValidator.validateCapability(cap), 'Validation failed for valid capability');

  console.log('   ✓ Capability Creation & Validation: PASSED');
}

async function testInvalidCapabilityRejection() {
  console.log('[Test] Invalid Capability Rejection starting...');

  // Invalid ID (empty)
  assert(!VerificationCapabilityValidator.validateCapability({
    id: '',
    type: VerificationCapabilityType.GIT_ACCESS,
    status: VerificationCapabilityStatus.AVAILABLE,
    lastChecked: new Date().toISOString()
  }), 'Validator should reject empty id');

  // Invalid Type
  assert(!VerificationCapabilityValidator.validateCapability({
    id: 'cap-invalid-type',
    type: 'NON_EXISTENT_TYPE',
    status: VerificationCapabilityStatus.AVAILABLE,
    lastChecked: new Date().toISOString()
  }), 'Validator should reject invalid type');

  // Invalid Status
  assert(!VerificationCapabilityValidator.validateCapability({
    id: 'cap-invalid-status',
    type: VerificationCapabilityType.FILE_ACCESS,
    status: 'UNKNOWN_STATUS',
    lastChecked: new Date().toISOString()
  }), 'Validator should reject invalid status');

  // Invalid lastChecked
  assert(!VerificationCapabilityValidator.validateCapability({
    id: 'cap-invalid-date',
    type: VerificationCapabilityType.API_ACCESS,
    status: VerificationCapabilityStatus.AVAILABLE,
    lastChecked: 'invalid-date-string'
  }), 'Validator should reject invalid date');

  // Factory throws error on invalid parameters
  let errorThrown = false;
  try {
    VerificationCapabilityFactory.createCapability({
      type: 'INVALID_TYPE' as any,
      status: VerificationCapabilityStatus.AVAILABLE
    });
  } catch (err) {
    errorThrown = true;
  }
  assert(errorThrown, 'Factory should throw error on invalid type');

  console.log('   ✓ Invalid Capability Rejection: PASSED');
}

async function testSnapshotCreationAndOverallStatus() {
  console.log('[Test] Snapshot Creation & Overall Status Calculation starting...');

  const cap1 = VerificationCapabilityFactory.createCapability({
    id: 'cap-browser-01',
    type: VerificationCapabilityType.BROWSER_AUTOMATION,
    status: VerificationCapabilityStatus.AVAILABLE
  });

  const cap2 = VerificationCapabilityFactory.createCapability({
    id: 'cap-git-01',
    type: VerificationCapabilityType.GIT_ACCESS,
    status: VerificationCapabilityStatus.AVAILABLE
  });

  // All AVAILABLE -> READY
  const snapshotReady = VerificationCapabilityFactory.createSnapshot({
    snapshotId: 'snap-01',
    capabilities: [cap1, cap2]
  });

  assert(snapshotReady.snapshotId === 'snap-01', 'Snapshot ID mismatch');
  assert(snapshotReady.overallStatus === 'READY', 'Overall status should be READY when all capabilities are AVAILABLE');
  assert(snapshotReady.capabilities.length === 2, 'Snapshot capability count mismatch');
  assert(VerificationCapabilityValidator.validateSnapshot(snapshotReady), 'Snapshot validation failed');

  // Partial AVAILABLE -> PARTIAL
  const capUnavailable = VerificationCapabilityFactory.createCapability({
    id: 'cap-cdp-offline',
    type: VerificationCapabilityType.CDP_ENDPOINT,
    status: VerificationCapabilityStatus.UNAVAILABLE
  });

  const snapshotPartial = VerificationCapabilityFactory.createSnapshot({
    capabilities: [cap1, capUnavailable]
  });
  assert(snapshotPartial.overallStatus === 'PARTIAL', 'Overall status should be PARTIAL when some capabilities are AVAILABLE');

  // All UNAVAILABLE -> UNAVAILABLE
  const snapshotUnavailable = VerificationCapabilityFactory.createSnapshot({
    capabilities: [capUnavailable]
  });
  assert(snapshotUnavailable.overallStatus === 'UNAVAILABLE', 'Overall status should be UNAVAILABLE when all capabilities are UNAVAILABLE');

  // Empty capabilities -> UNAVAILABLE
  const snapshotEmpty = VerificationCapabilityFactory.createSnapshot({
    capabilities: []
  });
  assert(snapshotEmpty.overallStatus === 'UNAVAILABLE', 'Overall status should be UNAVAILABLE for empty capabilities array');

  console.log('   ✓ Snapshot Creation & Overall Status Calculation: PASSED');
}

async function testImmutability() {
  console.log('[Test] Immutability checks starting...');

  const cap = VerificationCapabilityFactory.createCapability({
    type: VerificationCapabilityType.SCREENSHOT,
    status: VerificationCapabilityStatus.AVAILABLE,
    metadata: { quality: 90 }
  });

  let mutated = false;
  try {
    (cap as any).status = VerificationCapabilityStatus.DISABLED;
  } catch (err) {
    mutated = true;
  }
  assert(mutated || cap.status === VerificationCapabilityStatus.AVAILABLE, 'Capability status should be immutable');

  console.log('   ✓ Immutability checks: PASSED');
}

async function runAll() {
  console.log('--- Starting Verification Capability Model Foundation Unit Tests ---');
  await testCapabilityCreationAndValidation();
  await testInvalidCapabilityRejection();
  await testSnapshotCreationAndOverallStatus();
  await testImmutability();
  console.log('--- All Verification Capability Model Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
