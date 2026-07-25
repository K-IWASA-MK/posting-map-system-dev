import * as fs from 'fs';
import * as path from 'path';
import { NationalAddressDataPipeline } from '../../../src/platform/address-data-platform/pipeline/NationalAddressDataPipeline';
import { NationalAddressHierarchyParser } from '../../../src/platform/address-data-platform/parser/NationalAddressHierarchyParser';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runNationalAddressMasterV4Tests() {
  console.log('[Test NationalAddressMasterV4] Starting National Address Master v4 tests...');

  // Test 1: Rule v3 parsing schema (prefecture, municipality, address_level_1, address_level_2)
  console.log('[Test NationalAddressMasterV4] 1. Parsing schema check (東員町 1丁目)...');
  const rec1 = NationalAddressHierarchyParser.parseAddressRow('三重県', '東員町', '1丁目', '5110201');
  assert(rec1.municipality === '東員町', 'Municipality is 東員町');
  assert(rec1.addressLevel1 === '1丁目', 'Level 1 is 1丁目');
  assert(rec1.addressLevel2 === 'NULL', 'Level 2 is NULL for 東員町 1丁目');

  console.log('[Test NationalAddressMasterV4] 2. Parsing schema check (桑名市 江場 1丁目)...');
  const rec2 = NationalAddressHierarchyParser.parseAddressRow('三重県', '桑名市', '江場 1丁目', '5110002');
  assert(rec2.municipality === '桑名市', 'Municipality is 桑名市');
  assert(rec2.addressLevel1 === '江場', 'Level 1 is 江場');
  assert(rec2.addressLevel2 === '1丁目', 'Level 2 is 1丁目');

  console.log('[Test NationalAddressMasterV4] 3. Pipeline execution check...');
  const tmpDir = path.join(__dirname, '../../../scratch/test_national_v4');
  const pipeline = new NationalAddressDataPipeline();
  const res = pipeline.runPipeline(tmpDir);

  assert(fs.existsSync(res.rawAuditManifest.postal.relativePath ? path.join(tmpDir, 'raw/postal/KEN_ALL.CSV') : ''), 'KEN_ALL.CSV exists');
  assert(fs.existsSync(path.join(tmpDir, 'raw/raw_audit_manifest.json')), 'raw_audit_manifest.json exists');
  assert(fs.existsSync(res.masterEvidence.outputCsvPath), 'ADDRESS_MASTER.csv exists');
  assert(res.masterEvidence.sha256.length === 64, 'Master SHA-256 hash length is 64');

  console.log('\n=================================================');
  console.log('  NATIONAL ADDRESS MASTER V4 PIPELINE PASSED');
  console.log('=================================================\n');
}

runNationalAddressMasterV4Tests();
