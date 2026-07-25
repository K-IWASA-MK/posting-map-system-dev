import * as fs from 'fs';
import * as path from 'path';
import { NationalAddressPipeline } from '../../../src/platform/address-data-platform/NationalAddressPipeline';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runNationalAddressPipelineTests() {
  console.log('[Test NationalAddressPipeline] Starting National Address Data Platform tests...');

  const tmpDataDir = path.join(__dirname, '../../../scratch/test_national_data');
  const pipeline = new NationalAddressPipeline();

  const res = pipeline.runPipeline(tmpDataDir);

  console.log('[Test NationalAddressPipeline] 1. Ingest metadata check...');
  assert(res.ingestMetadata.filename === 'utf_ken_all.csv', 'Ingest filename is utf_ken_all.csv');
  assert(res.ingestMetadata.sha256.length === 64, 'SHA-256 hash length is 64');
  assert(res.ingestMetadata.recordCount > 0, 'Record count is greater than 0');
  assert(fs.existsSync(path.join(tmpDataDir, 'raw/postal/raw_hash.json')), 'raw_hash.json exists');

  console.log('[Test NationalAddressPipeline] 2. National Address Master CSV check...');
  assert(fs.existsSync(res.masterManifest.outputCsvPath), 'NATIONAL_ADDRESS_MASTER.csv exists');
  assert(res.masterManifest.sha256.length === 64, 'Master SHA-256 hash length is 64');
  assert(res.masterManifest.status === 'NATIONAL_ADDRESS_MASTER_READY', 'Status is NATIONAL_ADDRESS_MASTER_READY');

  console.log('\n=================================================');
  console.log('  NATIONAL ADDRESS DATA PLATFORM PIPELINE PASSED');
  console.log('=================================================\n');
}

runNationalAddressPipelineTests();
