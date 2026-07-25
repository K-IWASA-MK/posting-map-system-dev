import * as fs from 'fs';
import * as path from 'path';
import { NationalAddressDataPipeline } from '../../../src/platform/address-data-platform/pipeline/NationalAddressDataPipeline';
import { AddressMasterVerifier } from '../../../src/platform/address-data-platform/verifier/AddressMasterVerifier';
import { NationalAddressHierarchyParser } from '../../../src/platform/address-data-platform/parser/NationalAddressHierarchyParser';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runAddressMasterAccuracyVerifierTests() {
  console.log('[Test AddressMasterAccuracyVerifier] Starting STEP 5 Accuracy Verification tests...');

  // 1. Check Address Formatting Normalization (１丁目 -> 1丁目, 一丁目 -> 1丁目)
  console.log('[Test AddressMasterAccuracyVerifier] 1. Formatting Normalization check (１丁目 / 一丁目 -> 1丁目)...');
  const rawRec1 = NationalAddressHierarchyParser.parseAddressRow('三重県', '桑名市', '江場 １丁目', '5110002');
  const norm1 = AddressMasterVerifier.normalizeRecordFormatting(rawRec1);
  assert(norm1.addressLevel2 === '1丁目', 'Full-width number １丁目 normalized to half-width 1丁目');

  const rawRec2 = NationalAddressHierarchyParser.parseAddressRow('三重県', '桑名市', '江場 一丁目', '5110002');
  const norm2 = AddressMasterVerifier.normalizeRecordFormatting(rawRec2);
  assert(norm2.addressLevel2 === '1丁目', 'Kanji number 一丁目 normalized to 1丁目');

  // 2. Pipeline STEP 5 Execution Check
  console.log('[Test AddressMasterAccuracyVerifier] 2. Pipeline STEP 5 Execution check...');
  const tmpDir = path.join(__dirname, '../../../scratch/test_national_v5_verification');
  const pipeline = new NationalAddressDataPipeline();
  const res = pipeline.runPipeline(tmpDir);

  assert(res.verificationReport.verificationStatus === 'ADDRESS_MASTER_VERIFICATION_PASS', 'Verification status is ADDRESS_MASTER_VERIFICATION_PASS');
  assert(res.verificationReport.missingLevel1Count === 0, 'Missing level 1 count is 0');
  assert(res.verificationReport.lineageProof.lineageMatch === true, 'Lineage proof SHA-256 match is true');
  assert(fs.existsSync(path.join(tmpDir, 'master/address_master_accuracy_verification.json')), 'address_master_accuracy_verification.json exists');

  console.log('\n=================================================');
  console.log('  ADDRESS MASTER ACCURACY VERIFICATION PASSED');
  console.log('=================================================\n');
}

runAddressMasterAccuracyVerifierTests();
