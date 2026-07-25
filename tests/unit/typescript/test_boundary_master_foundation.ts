import * as fs from 'fs';
import * as path from 'path';
import { NationalAddressDataPipeline } from '../../../src/platform/address-data-platform/pipeline/NationalAddressDataPipeline';
import { DistrictBoundaryDefinition } from '../../../src/platform/address-data-platform/boundary/BoundaryMasterFoundation';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runBoundaryMasterFoundationTests() {
  console.log('[Test BoundaryMasterFoundation] Starting STEP 7 Boundary Master Foundation tests...');

  const tmpDir = path.join(__dirname, '../../../scratch/test_national_v7_boundary');
  const pipeline = new NationalAddressDataPipeline();

  const mie03BoundaryDef: DistrictBoundaryDefinition = {
    districtId: 'MIE-03',
    districtName: '三重県第3区',
    prefecture: '三重県',
    wholeMunicipalities: ['桑名市', 'いなべ市', '木曽岬町', '東員町', '菰野町', '朝日町', '川越町'],
    splitMunicipalities: [
      {
        municipality: '四日市市',
        includedKeywords: ['富田', '富州原', '羽津'],
        excludedKeywords: ['日永', '笹川', '楠町', '内部', '塩浜', '海蔵', '三重', '桜']
      }
    ]
  };

  const res = pipeline.runPipeline(tmpDir, mie03BoundaryDef);

  console.log('[Test BoundaryMasterFoundation] 1. Release Gate check...');
  assert(res.releaseManifest.currentState === 'RELEASED', 'RELEASED state is required before STEP 7');

  console.log('[Test BoundaryMasterFoundation] 2. Boundary Manifest check...');
  assert(res.boundaryManifest !== undefined, 'Boundary Manifest exists');
  assert(res.boundaryManifest?.districtId === 'MIE-03', 'District ID is MIE-03');
  assert(res.boundaryManifest?.status === 'BOUNDARY_MASTER_READY', 'Status is BOUNDARY_MASTER_READY');
  assert((res.boundaryManifest?.boundRecordCount || 0) > 0, 'Bound record count > 0');

  console.log('[Test BoundaryMasterFoundation] 3. File output check...');
  assert(fs.existsSync(path.join(tmpDir, 'boundary/BOUNDARY_MASTER_MIE-03.csv')), 'BOUNDARY_MASTER_MIE-03.csv exists');
  assert(fs.existsSync(path.join(tmpDir, 'boundary/boundary_master_MIE-03_manifest.json')), 'boundary_master_MIE-03_manifest.json exists');

  console.log('\n=================================================');
  console.log('  BOUNDARY MASTER FOUNDATION PASSED');
  console.log('=================================================\n');
}

runBoundaryMasterFoundationTests();
