import * as fs from 'fs';
import * as path from 'path';
import { NationalAddressDataPipeline } from '../../../src/platform/address-data-platform/pipeline/NationalAddressDataPipeline';
import { DistrictBoundaryDefinition } from '../../../src/platform/address-data-platform/boundary/BoundaryMasterFoundation';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runBoundaryMasterAccuracyVerifierTests() {
  console.log('[Test BoundaryMasterAccuracyVerifier] Starting STEP 8 Boundary Accuracy Verification tests...');

  const tmpDir = path.join(__dirname, '../../../scratch/test_national_v8_boundary_verifier');
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

  console.log('[Test BoundaryMasterAccuracyVerifier] 1. Boundary Accuracy Report check...');
  assert(res.boundaryAccuracyReport !== undefined, 'Boundary Accuracy Report exists');
  assert(res.boundaryAccuracyReport?.verificationStatus === 'BOUNDARY_ACCURACY_VERIFICATION_PASS', 'Status is BOUNDARY_ACCURACY_VERIFICATION_PASS');
  assert(res.boundaryAccuracyReport?.municipalityInclusionStatus === 'ALL_MUNICIPALITIES_INCLUDED_PASS', 'Inclusion status is ALL_MUNICIPALITIES_INCLUDED_PASS');
  assert(res.boundaryAccuracyReport?.splitMunicipalityDiffStatus === 'SPLIT_DIFFERENCE_EXACT_PASS', 'Split difference status is SPLIT_DIFFERENCE_EXACT_PASS');
  assert(res.boundaryAccuracyReport?.unassignedAddressCount === 0, 'Unassigned address count is 0');
  assert(res.boundaryAccuracyReport?.dualAssignedCount === 0, 'Dual assigned count is 0');

  console.log('[Test BoundaryMasterAccuracyVerifier] 2. Report file output check...');
  assert(fs.existsSync(path.join(tmpDir, 'boundary/boundary_accuracy_MIE-03_report.json')), 'boundary_accuracy_MIE-03_report.json exists');

  console.log('\n=================================================');
  console.log('  BOUNDARY MASTER ACCURACY VERIFIER PASSED');
  console.log('=================================================\n');
}

runBoundaryMasterAccuracyVerifierTests();
