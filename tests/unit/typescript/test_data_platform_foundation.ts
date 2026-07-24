import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { DataPlatformPipeline } from '../../../src/platform/data-platform/pipeline/DataPlatformPipeline';
import { DistrictValidationProfile, MIE03_VALIDATION_PROFILE } from '../../../src/platform/data-platform/schema/AreaSchema';
import { RawDataPreserver } from '../../../src/platform/data-platform/integrity/RawDataPreserver';
import { DataValidator } from '../../../src/platform/data-platform/validator/DataValidator';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

async function runDataPlatformTests() {
  console.log('[Test DataPlatform] Starting POSTING MAP Data Platform Foundation tests...');

  // Test 1: DistrictValidationProfile flexibility check
  console.log('[Test DataPlatform] 1. DistrictValidationProfile flexibility check...');
  const customProfile: DistrictValidationProfile = {
    districtId: 'SHIZUOKA-05',
    districtName: '静岡第5区',
    prefecture: '静岡県',
    expectedCount: 520,
    source: '静岡県区割りデータ',
    version: '2026-07'
  };
  assert(customProfile.expectedCount === 520, 'Validation profile supports non-hardcoded expectedCount');
  assert(customProfile.districtId === 'SHIZUOKA-05', 'Validation profile supports generic district ID');

  // Test 2: RawDataPreserver hashing
  console.log('[Test DataPlatform] 2. RawDataPreserver integrity check...');
  const preserver = new RawDataPreserver();
  const refDir = path.join(__dirname, '../../../projects/posting-map/reference');
  const samplePath = path.join(refDir, '三重県選挙区区割り.csv');
  if (fs.existsSync(samplePath)) {
    const snap = preserver.registerAndPreserve(samplePath);
    assert(snap.sha256.length === 64, 'SHA-256 digest is valid 64-hex string');
    assert(snap.fileBasename === '三重県選挙区区割り.csv', 'Snapshot basename matches');
  }

  // Test 3: E2E Pipeline Execution
  console.log('[Test DataPlatform] 3. E2E Pipeline Execution...');
  const pipeline = new DataPlatformPipeline();
  const result = pipeline.run({
    profile: MIE03_VALIDATION_PROFILE,
    generatedBy: 'DistrictInitializationAgent'
  });

  assert(result.report.passed === true, 'Data validation passed with zero errors');
  assert(result.report.totalRecords === 651, 'Extracted total records match expected 651 for MIE-03');
  assert(result.evidence.validation === 'PASS', 'Evidence validation status is PASS');
  assert(result.evidence.pipeline === 'DataPlatformFoundation', 'Evidence pipeline name matches');
  assert(result.evidence.generatedBy === 'DistrictInitializationAgent', 'Evidence generatedBy matches agent identity');
  assert(result.evidence.inputHash.length === 64, 'Evidence inputHash is valid SHA-256');
  assert(result.evidence.outputHash.length === 64, 'Evidence outputHash is valid SHA-256');

  // Test 4: Final Verified CSV Schema Compliance
  console.log('[Test DataPlatform] 4. Final Verified CSV Schema Compliance...');
  assert(fs.existsSync(result.csvPath), 'Final Verified CSV file exists');
  const csvContent = fs.readFileSync(result.csvPath, 'utf8');
  const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
  assert(lines.length === 652, 'CSV contains 1 header line + 651 record lines (652 total)');

  const header = lines[0];
  const expectedHeader = 'area_id,district_id,prefecture,city,town,postal_code,municipality_code,source,generated_at,version,status,hash';
  assert(header === expectedHeader, `CSV header matches required SSOT schema (${header})`);

  // Verify record columns & metadata
  const sampleRecord = lines[1].split(',');
  assert(sampleRecord.length === 12, 'Each record has exactly 12 columns');
  assert(sampleRecord[0].startsWith('MIE03-'), 'area_id starts with district prefix');
  assert(sampleRecord[1] === 'MIE-03', 'district_id matches MIE-03');
  assert(sampleRecord[2] === '三重県', 'prefecture matches 三重県');
  assert(sampleRecord[9] === 'v1', 'version column is present');
  assert(sampleRecord[10] === 'FROZEN', 'status column is FROZEN');
  assert(sampleRecord[11].length === 64, 'hash column contains valid SHA-256 string');

  // Test 5: SHA-256 checksum file matching
  console.log('[Test DataPlatform] 5. SHA-256 Checksum File Matching...');
  const sha256Path = `${result.csvPath}.sha256`;
  assert(fs.existsSync(sha256Path), 'SHA-256 signature file exists');
  const sha256Content = fs.readFileSync(sha256Path, 'utf8').trim();
  const fileHash = crypto.createHash('sha256').update(csvContent).digest('hex');
  assert(sha256Content.startsWith(fileHash), 'SHA-256 signature matches actual CSV file hash');

  console.log('\n======================================');
  console.log('  DATA PLATFORM FOUNDATION PASSED');
  console.log('======================================\n');
}

runDataPlatformTests().catch(err => {
  console.error('❌ Test Failure:', err);
  process.exit(1);
});
