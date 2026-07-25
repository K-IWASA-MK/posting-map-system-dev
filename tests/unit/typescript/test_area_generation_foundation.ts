import * as fs from 'fs';
import * as path from 'path';
import { NationalAddressDataPipeline } from '../../../src/platform/address-data-platform/pipeline/NationalAddressDataPipeline';
import { DistrictBoundaryDefinition } from '../../../src/platform/address-data-platform/boundary/BoundaryMasterFoundation';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runAreaGenerationFoundationTests() {
  console.log('[Test AreaGenerationFoundation] Starting STEP 9 Area Generation Foundation tests...');

  const tmpDir = path.join(__dirname, '../../../scratch/test_national_v9_area');
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

  console.log('[Test AreaGenerationFoundation] 1. Area Manifest check...');
  assert(res.areaManifest !== undefined, 'Area Manifest exists');
  assert(res.areaManifest?.districtId === 'MIE-03', 'District ID is MIE-03');
  assert((res.areaManifest?.totalAreas || 0) > 0, 'Total areas > 0');

  console.log('[Test AreaGenerationFoundation] 2. Area Accuracy Report check...');
  assert(res.areaAccuracyReport !== undefined, 'Area Accuracy Report exists');
  assert(res.areaAccuracyReport?.verificationStatus === 'AREA_ACCURACY_VERIFICATION_PASS', 'Status is AREA_ACCURACY_VERIFICATION_PASS');
  assert(res.areaAccuracyReport?.duplicateAreaIdCount === 0, 'Duplicate area ID count is 0');
  assert(res.areaAccuracyReport?.postalCodeAscendingPass === true, 'Postal code ascending order is true');

  console.log('[Test AreaGenerationFoundation] 3. File output check...');
  assert(fs.existsSync(path.join(tmpDir, 'output/MIE-03_FINAL_VERIFIED_AREAS.csv')), 'MIE-03_FINAL_VERIFIED_AREAS.csv exists');
  assert(fs.existsSync(path.join(tmpDir, 'output/area_generation_MIE-03_manifest.json')), 'area_generation_MIE-03_manifest.json exists');
  assert(fs.existsSync(path.join(tmpDir, 'output/area_accuracy_MIE-03_report.json')), 'area_accuracy_MIE-03_report.json exists');

  console.log('\n=================================================');
  console.log('  AREA GENERATION FOUNDATION PASSED');
  console.log('=================================================\n');
}

runAreaGenerationFoundationTests();
