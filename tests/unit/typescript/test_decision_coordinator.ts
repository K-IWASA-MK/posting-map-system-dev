import { DecisionCoordinator } from '../../../aios/kernel/DecisionCoordinator';
import { ValidationResult } from '../../../aios/kernel/ValidationResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testDecisionCoordinatorNormal() {
  console.log('[Test] DecisionCoordinator normal routing scenarios starting...');

  // 1. decision-v1
  const validDec: ValidationResult = {
    valid: true,
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    errors: []
  };
  const payloadDec = { decisionId: "DEC-1" };
  const resDec = DecisionCoordinator.coordinate(validDec, payloadDec);
  assert(resDec.accepted, "Valid decision must be accepted");
  assert(resDec.nextStage === "SIGNING", "Decision nextStage should default to SIGNING");
  assert(resDec.targetAgents.includes("agent-architecture") && resDec.targetAgents.includes("agent-uiux"), "Should target uiux and architecture");
  assert(resDec.errors.length === 0, "No errors expected");

  // 2. consensus-v1
  const validCon: ValidationResult = {
    valid: true,
    protocolId: "aios-consensus-v1",
    protocolVersion: "1.0.0",
    errors: []
  };
  const resCon = DecisionCoordinator.coordinate(validCon, {});
  assert(resCon.accepted, "Valid consensus must be accepted");
  assert(resCon.nextStage === "LEDGER_COMMIT", "Consensus nextStage must be LEDGER_COMMIT");
  assert(resCon.targetAgents.length === 1 && resCon.targetAgents[0] === "agent-architecture", "Consensus should target agent-architecture");

  console.log('   ✓ DecisionCoordinator normal routing scenarios: PASSED');
}

async function testDecisionCoordinatorAbnormal() {
  console.log('[Test] DecisionCoordinator boundary/rejection scenarios starting...');

  // 1. Failed Schema Validation Input (Contract-01)
  const invalidVal: ValidationResult = {
    valid: false,
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    errors: [{ code: "MISSING_REQUIRED", field: "decisionId", message: "Missing field" }]
  };
  const resVal = DecisionCoordinator.coordinate(invalidVal, {});
  assert(!resVal.accepted, "Invalid validationResult should be rejected");
  assert(resVal.nextStage === "REJECTED", "nextStage must be REJECTED");
  assert(resVal.errors.some(e => e.code === "VALIDATION_FAILED"), "Should return VALIDATION_FAILED error code");

  // 2. Unknown Protocol / Empty Targets
  const validUnknown: ValidationResult = {
    valid: true,
    protocolId: "unknown-protocol-id",
    protocolVersion: "1.0.0",
    errors: []
  };
  const resUnknown = DecisionCoordinator.coordinate(validUnknown, {});
  assert(!resUnknown.accepted, "Unknown protocols must be rejected");
  assert(resUnknown.nextStage === "REJECTED", "nextStage must be REJECTED");
  assert(resUnknown.errors.some(e => e.code === "EMPTY_TARGET_AGENTS"), "Expected EMPTY_TARGET_AGENTS error");

  console.log('   ✓ DecisionCoordinator boundary/rejection scenarios: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-3: DecisionCoordinator Unit Tests ---');
  await testDecisionCoordinatorNormal();
  await testDecisionCoordinatorAbnormal();
  console.log('--- All G7-3: DecisionCoordinator Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
