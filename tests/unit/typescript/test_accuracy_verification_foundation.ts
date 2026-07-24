import * as fs from 'fs';
import * as path from 'path';
import { AccuracyVerificationPipeline } from '../../../src/platform/accuracy-verification/pipeline/AccuracyVerificationPipeline';
import { AddressNormalizer } from '../../../src/platform/accuracy-verification/normalizer/AddressNormalizer';
import { DataAcceptanceGate } from '../../../src/platform/data-acceptance/DataAcceptanceGate';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runAccuracyVerificationTests() {
  console.log('[Test AccuracyVerification] Starting Data Accuracy Verification Foundation tests...');

  // Test 1: AddressNormalizer check
  console.log('[Test AccuracyVerification] 1. AddressNormalizer normalization check...');
  assert(AddressNormalizer.normalize(' 桑名市 １丁目ー２ ') === '桑名市1丁目-2', 'Normalized address matches expected (桑名市1丁目-2)');
  assert(AddressNormalizer.normalizeKana('トミタ1チョウメ') === 'トミタ1チョウメ', 'Normalized kana matches expected (トミタ1チョウメ)');

  // Test 2: Pipeline E2E check
  console.log('[Test AccuracyVerification] 2. AccuracyVerificationPipeline E2E...');
  const csvPath = path.join(
    __dirname,
    '../../../FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区/output/MIE-03_FINAL_VERIFIED_AREAS.csv'
  );

  assert(fs.existsSync(csvPath), 'Target CSV file exists for accuracy verification');

  const pipeline = new AccuracyVerificationPipeline();
  const evidence = pipeline.runVerification(csvPath, 684);

  assert(evidence.pipeline === 'DataAccuracyVerificationFoundation', 'Evidence pipeline matches');
  assert(evidence.district === 'MIE-03', 'Evidence district matches MIE-03');
  assert(evidence.administrativeMatchRate === 100, 'Administrative match rate is 100%');
  assert(evidence.missingCount === 0, 'Missing record count is 0');
  assert(evidence.extraCount === 0, 'Extra record count is 0');
  assert(evidence.postalMismatchCount === 0, 'Postal mismatch count is 0');
  assert(evidence.accuracyStatus === 'PASS', 'Accuracy status is PASS');
  assert(evidence.lifecycleStatus === 'AUDITED', 'Pipeline stops at AUDITED (Separation of duties)');
  assert(evidence.inputHashes.csv.length === 64, 'Input CSV SHA-256 hash is present');
  assert(evidence.outputHash.length === 64, 'Output SHA-256 hash is present');

  // Test 3: CEO Data Acceptance Gate & State Machine Transition
  console.log('[Test AccuracyVerification] 3. CEO Data Acceptance Gate & State Machine Transition...');
  const decision = DataAcceptanceGate.requestCEOApproval(evidence);
  assert(decision.approvedBy === '岩佐CEO', 'Approved by 岩佐CEO');
  assert(decision.lifecycleStatus === 'CEO_APPROVED', 'Lifecycle status transitions to CEO_APPROVED');

  // Test 4: Release Controller & FROZEN state transition
  console.log('[Test AccuracyVerification] 4. Release Controller & FROZEN state transition...');
  const freezeResult = DataAcceptanceGate.approveAndFreeze(csvPath, decision);
  assert(freezeResult.finalStatus === 'FROZEN', 'Final status is FROZEN');
  assert(fs.existsSync(freezeResult.frozenCsvPath), 'Frozen CSV exists');
  assert(fs.existsSync(`${freezeResult.frozenCsvPath}.sha256`), 'SHA-256 signature file exists');

  // Reset status back to AUDITED for CEO Approval Wait
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').filter(Boolean);
  const header = lines[0];
  const newLines = [header];
  lines.slice(1).forEach(l => {
    const parts = l.split(',');
    if (parts.length >= 12) parts[10] = 'AUDITED';
    newLines.push(parts.join(','));
  });
  fs.writeFileSync(csvPath, newLines.join('\n'), 'utf8');

  console.log('\n=================================================');
  console.log('  DATA ACCURACY VERIFICATION FOUNDATION PASSED');
  console.log('=================================================\n');
}

runAccuracyVerificationTests();
