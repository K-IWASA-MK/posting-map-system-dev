import { SchemaValidator } from '../../../aios/kernel/SchemaValidator';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// ==============================================================================
// Normal Cases (Valid Payloads)
// ==============================================================================
async function testNormalValidation() {
  console.log('[Test] SchemaValidator normal cases starting...');

  // 1. decision-v1
  const decisionPayload = {
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    compatibleVersions: ["^1.0.0"],
    decisionId: "DEC-TEST-001",
    identity: "agent-architecture",
    capabilityScope: "projects/posting-map",
    context: "UI alignment",
    action: "adopt glassmorphism",
    payload: { style: "glass" },
    timestamp: "2026-07-20T12:00:00Z",
    signatures: [
      {
        signer: "agent-uiux",
        verdict: "APPROVED",
        timestamp: "2026-07-20T12:05:00Z"
      }
    ]
  };
  const decRes = SchemaValidator.validate('aios-decision-v1', decisionPayload);
  assert(decRes.valid, `decision-v1 must be valid. Errors: ${JSON.stringify(decRes.errors)}`);
  assert(decRes.errors.length === 0, 'decision-v1 should have 0 errors');

  // 2. consensus-v1
  const consensusPayload = {
    protocolId: "aios-consensus-v1",
    protocolVersion: "1.0.2",
    compatibleVersions: ["^1.0.0"],
    sessionId: "SES-CON-001",
    targetDecisionId: "DEC-TEST-001",
    voters: ["agent-uiux", "agent-architecture"],
    scores: { "agent-uiux": 95, "agent-architecture": 90 },
    consensusVerdict: "PASS",
    timestamp: "2026-07-20T12:10:00Z"
  };
  const conRes = SchemaValidator.validate('aios-consensus-v1', consensusPayload);
  assert(conRes.valid, `consensus-v1 must be valid. Errors: ${JSON.stringify(conRes.errors)}`);

  // 3. capability-v1
  const capabilityPayload = {
    protocolId: "aios-capability-v1",
    protocolVersion: "1.0.0",
    compatibleVersions: ["^1.0.0"],
    identity: "agent-uiux",
    allowedPaths: ["projects/posting-map/src/dashboard"],
    capabilities: ["WRITE_UI_CODE", "READ_RESOURCES"],
    timestamp: "2026-07-20T12:00:00Z"
  };
  const capRes = SchemaValidator.validate('aios-capability-v1', capabilityPayload);
  assert(capRes.valid, `capability-v1 must be valid. Errors: ${JSON.stringify(capRes.errors)}`);

  // 4. ledger-v1
  const ledgerPayload = {
    protocolId: "aios-ledger-v1",
    protocolVersion: "1.0.0",
    compatibleVersions: ["^1.0.0"],
    blockIndex: 42,
    timestamp: "2026-07-20T12:15:00Z",
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    payload: { some: "data" },
    hash: "a593e8271a364121bf236e788bc27f7fef48bc29731d1d9d9351eef3556dfef4"
  };
  const ledRes = SchemaValidator.validate('aios-ledger-v1', ledgerPayload);
  assert(ledRes.valid, `ledger-v1 must be valid. Errors: ${JSON.stringify(ledRes.errors)}`);

  // 5. governance-v1
  const governancePayload = {
    protocolId: "aios-governance-v1",
    protocolVersion: "1.0.0",
    compatibleVersions: ["^1.0.0"],
    promiseId: "PRM-101",
    visionRef: "VIS-OS-ROOT",
    owner: "CEO-IWASA",
    executors: ["agent-architecture"],
    reviewers: ["agent-uiux"],
    status: "ACCEPTED",
    timestamp: "2026-07-20T12:00:00Z"
  };
  const govRes = SchemaValidator.validate('aios-governance-v1', governancePayload);
  assert(govRes.valid, `governance-v1 must be valid. Errors: ${JSON.stringify(govRes.errors)}`);

  console.log('   ✓ SchemaValidator normal cases: PASSED');
}

// ==============================================================================
// Abnormal Cases (Invalid Payloads)
// ==============================================================================
async function testAbnormalValidation() {
  console.log('[Test] SchemaValidator abnormal cases starting...');

  // 1. Unknown Protocol
  const res1 = SchemaValidator.validate('unknown-id', {});
  assert(!res1.valid, 'Unknown protocol validation must fail');
  assert(res1.errors[0].code === 'UNKNOWN_PROTOCOL', 'Expected UNKNOWN_PROTOCOL code');

  // 2. Invalid Version
  const payload2 = {
    protocolId: "aios-decision-v1",
    protocolVersion: "2.0.0", // Compatible is ^1.0.0, so 2.0.0 should fail compatibility
    compatibleVersions: ["^1.0.0"],
    decisionId: "DEC-TEST-001",
    identity: "agent-architecture",
    capabilityScope: "projects/posting-map",
    context: "UI alignment",
    action: "adopt glassmorphism",
    payload: {},
    timestamp: "2026-07-20T12:00:00Z",
    signatures: []
  };
  const res2 = SchemaValidator.validate('aios-decision-v1', payload2);
  assert(!res2.valid, 'Incompatible major version must fail');
  assert(res2.errors.some(e => e.code === 'VERSION_INCOMPATIBLE'), 'Expected VERSION_INCOMPATIBLE error');

  // 3. Missing Required Field
  const payload3 = {
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    compatibleVersions: ["^1.0.0"],
    // missing decisionId
    identity: "agent-architecture",
    capabilityScope: "projects/posting-map",
    context: "UI alignment",
    action: "adopt glassmorphism",
    payload: {},
    timestamp: "2026-07-20T12:00:00Z",
    signatures: []
  };
  const res3 = SchemaValidator.validate('aios-decision-v1', payload3);
  assert(!res3.valid, 'Missing decisionId must fail validation');
  assert(res3.errors.some(e => e.code === 'MISSING_REQUIRED' && e.field === 'decisionId'), 'Expected MISSING_REQUIRED code for decisionId');

  // 4. Invalid Enum
  const payload4 = {
    protocolId: "aios-governance-v1",
    protocolVersion: "1.0.0",
    compatibleVersions: ["^1.0.0"],
    promiseId: "PRM-101",
    visionRef: "VIS-OS-ROOT",
    owner: "CEO-IWASA",
    executors: ["agent-architecture"],
    reviewers: ["agent-uiux"],
    status: "INVALID_STATUS_NAME", // Must be DRAFT, ACCEPTED, etc.
    timestamp: "2026-07-20T12:00:00Z"
  };
  const res4 = SchemaValidator.validate('aios-governance-v1', payload4);
  assert(!res4.valid, 'Invalid enum value must fail');
  assert(res4.errors.some(e => e.code === 'INVALID_ENUM' && e.field === 'status'), 'Expected INVALID_ENUM error for status');

  // 5. Invalid Type
  const payload5 = {
    protocolId: "aios-capability-v1",
    protocolVersion: "1.0.0",
    compatibleVersions: ["^1.0.0"],
    identity: 12345, // Should be string
    allowedPaths: ["projects/posting-map/src/dashboard"],
    capabilities: ["WRITE_UI_CODE"],
    timestamp: "2026-07-20T12:00:00Z"
  };
  const res5 = SchemaValidator.validate('aios-capability-v1', payload5);
  assert(!res5.valid, 'Invalid type must fail');
  assert(res5.errors.some(e => e.code === 'INVALID_TYPE' && e.field === 'identity'), 'Expected INVALID_TYPE error for identity');

  // 6. Empty Payload
  const res6 = SchemaValidator.validate('aios-decision-v1', null);
  assert(!res6.valid, 'Null payload must fail');
  assert(res6.errors[0].code === 'INVALID_PAYLOAD', 'Expected INVALID_PAYLOAD code');

  console.log('   ✓ SchemaValidator abnormal cases: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-2: SchemaValidator Unit Tests ---');
  await testNormalValidation();
  await testAbnormalValidation();
  console.log('--- All G7-2: SchemaValidator Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
