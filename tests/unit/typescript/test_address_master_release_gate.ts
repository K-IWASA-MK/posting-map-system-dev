import * as fs from 'fs';
import * as path from 'path';
import { NationalAddressDataPipeline } from '../../../src/platform/address-data-platform/pipeline/NationalAddressDataPipeline';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runAddressMasterReleaseGateTests() {
  console.log('[Test AddressMasterReleaseGate] Starting STEP 6 Release Gate tests...');

  const tmpDir = path.join(__dirname, '../../../scratch/test_national_v6_gate');
  const pipeline = new NationalAddressDataPipeline();
  const res = pipeline.runPipeline(tmpDir);

  console.log('[Test AddressMasterReleaseGate] 1. Manifest and state transition check...');
  assert(res.releaseManifest.gateStatus === 'ADDRESS_MASTER_RELEASE_PASS', 'Gate status is ADDRESS_MASTER_RELEASE_PASS');
  assert(res.releaseManifest.currentState === 'RELEASED', 'Current state is RELEASED');
  assert(res.releaseManifest.stateHistory.length === 5, 'State history has 5 transitions');
  assert(res.releaseManifest.stateHistory[4].state === 'RELEASED', 'Final state in history is RELEASED');

  console.log('[Test AddressMasterReleaseGate] 2. File output check...');
  assert(fs.existsSync(path.join(tmpDir, 'master/address_master_release_manifest.json')), 'address_master_release_manifest.json exists');
  assert(res.releaseManifest.lineage.releaseHash.length === 64, 'Release Hash is valid 64-char SHA-256');

  console.log('\n=================================================');
  console.log('  ADDRESS MASTER RELEASE GATE PASSED');
  console.log('=================================================\n');
}

runAddressMasterReleaseGateTests();
