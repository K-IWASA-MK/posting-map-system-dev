import * as fs from 'fs';
import * as path from 'path';
import { AddressNormalizer } from '../../../src/platform/accuracy-verification/normalizer/AddressNormalizer';
import { AccuracyVerificationPipeline } from '../../../src/platform/accuracy-verification/pipeline/AccuracyVerificationPipeline';
import { DataAcceptanceGate } from '../../../src/platform/data-acceptance/DataAcceptanceGate';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

async function runAccuracyVerificationTests() {
  console.log('[Test AccuracyVerification] Starting Data Accuracy Verification Foundation tests...');

  // Test 1: AddressNormalizer
  console.log('[Test AccuracyVerification] 1. AddressNormalizer normalization check...');
  const rawAddr = '四日市市　富田１丁目（第２区に属しない区域）';
  const normAddr = AddressNormalizer.normalize(rawAddr);
  assert(normAddr === '四日市市富田1丁目', `Normalized address matches expected (${normAddr})`);

  const rawKana = 'ﾄﾐﾀ1ﾁｮｳﾒ';
  const normKana = AddressNormalizer.normalizeKana(rawKana);
  assert(normKana === 'トミタ1チョウメ', `Normalized kana matches expected (${normKana})`);

  // Test 2: AccuracyVerificationPipeline E2E (AUDITED status)
  console.log('[Test AccuracyVerification] 2. AccuracyVerificationPipeline E2E...');
  const csvPath = path.join(
    __dirname,
    '../../../FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区/output/MIE-03_FINAL_VERIFIED_AREAS.csv'
  );

  assert(fs.existsSync(csvPath), 'Target CSV file exists for accuracy verification');

  const pipeline = new AccuracyVerificationPipeline();
  const evidence = pipeline.runVerification(csvPath, 651);

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

  assert(decision.accepted === true, 'CEO acceptance gate accepted decision');
  assert(decision.lifecycleStatus === 'CEO_APPROVED', 'Lifecycle transitioned to CEO_APPROVED');
  assert(decision.approvedBy === '岩佐CEO', 'Approved by 岩佐CEO');

  // Test 4: Release Controller & FROZEN state transition
  console.log('[Test AccuracyVerification] 4. Release Controller & FROZEN state transition...');
  const freezeResult = DataAcceptanceGate.approveAndFreeze(csvPath, decision);

  assert(freezeResult.finalStatus === 'FROZEN', 'Final status transitioned to FROZEN');
  assert(freezeResult.frozenHash.length === 64, 'Frozen SHA-256 hash generated');

  const frozenCsvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = frozenCsvContent.split('\n').filter(Boolean);
  const sampleRecord = lines[1].split(',');
  assert(sampleRecord[10] === 'FROZEN', 'CSV record status updated to FROZEN');

  console.log('\n=================================================');
  console.log('  DATA ACCURACY VERIFICATION FOUNDATION PASSED');
  console.log('=================================================\n');
}

runAccuracyVerificationTests().catch(err => {
  console.error('❌ Test Failure:', err);
  process.exit(1);
});
