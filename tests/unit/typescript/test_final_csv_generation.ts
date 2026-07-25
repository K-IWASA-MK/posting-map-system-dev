import * as fs from 'fs';
import * as path from 'path';
import { FinalCsvGenerator } from '../../../src/platform/data-platform/final-csv/FinalCsvGenerator';
import { AreaRecord } from '../../../src/platform/data-platform/schema/AreaSchema';
import { PostalSortEngine } from '../../../src/platform/data-platform/final-csv/PostalSortEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runFinalCsvGenerationTests() {
  console.log('[Test FinalCsvGeneration] Starting Final CSV Generator tests...');

  const sampleRecords: AreaRecord[] = [
    {
      areaId: 'MIE03-000002',
      districtId: 'MIE-03',
      prefecture: '三重県',
      city: '桑名市',
      town: '大字桑名',
      postalCode: '511-0002',
      municipalityCode: '24205',
      source: 'POSTAL+ADMIN',
      generatedAt: '2026-07-24',
      version: 'v1',
      status: 'AUDITED',
      hash: 'hash002'
    },
    {
      areaId: 'MIE03-000001',
      districtId: 'MIE-03',
      prefecture: '三重県',
      city: '桑名市',
      town: '大字太夫',
      postalCode: '511-0001',
      municipalityCode: '24205',
      source: 'POSTAL+ADMIN',
      generatedAt: '2026-07-24',
      version: 'v1',
      status: 'AUDITED',
      hash: 'hash001'
    }
  ];

  console.log('[Test FinalCsvGeneration] 1. PostalSortEngine ascending sort check...');
  const sorted = PostalSortEngine.sortAscending(sampleRecords);
  assert(sorted[0].postalCode === '511-0001', 'First record postal code is 511-0001');
  assert(sorted[1].postalCode === '511-0002', 'Second record postal code is 511-0002');

  console.log('[Test FinalCsvGeneration] 2. FinalCsvGenerator output check...');
  const tmpOut = path.join(__dirname, '../../../scratch/test_out');
  const tmpLog = path.join(__dirname, '../../../scratch/test_log');

  const res = FinalCsvGenerator.generateFinalCsv('MIE-03', sampleRecords, tmpOut, tmpLog);

  assert(fs.existsSync(res.csvPath), 'Final CSV exists');
  assert(fs.existsSync(res.sha256Path), 'SHA-256 file exists');
  assert(res.outputHash.length === 64, 'SHA-256 hash length is 64');
  assert(res.recordCount === 2, 'Record count is 2');
  assert(res.evidence.ssotStatus === 'FINAL_VERIFIED_SSOT', 'Evidence SSOT status is FINAL_VERIFIED_SSOT');

  console.log('\n=================================================');
  console.log('  POSTING MAP FINAL CSV GENERATION PASSED');
  console.log('=================================================\n');
}

runFinalCsvGenerationTests();
