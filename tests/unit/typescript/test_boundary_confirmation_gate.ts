import { BoundaryConfirmationGate } from '../../../src/platform/data-platform/gate/BoundaryConfirmationGate';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runBoundaryConfirmationGateTests() {
  console.log('[Test BoundaryConfirmationGate] Starting STEP 0 Municipality Split Risk Analysis tests...');

  const municipalities = [
    '桑名市', 'いなべ市', '木曽岬町', '東員町', '菰野町', '朝日町', '川越町', '四日市市（一部）'
  ];

  const manifest = BoundaryConfirmationGate.analyzeAndValidate('MIE-03', municipalities);

  console.log('[Test BoundaryConfirmationGate] 1. Manifest properties check...');
  assert(manifest.districtId === 'MIE-03', 'District ID is MIE-03');
  assert(manifest.gateStatus === 'PASS', 'Gate status is PASS');
  assert(manifest.wholeMunicipalities.length === 7, '7 whole municipalities detected (Pattern A)');
  assert(manifest.splitMunicipalities.length === 1, '1 split municipality detected (Pattern B)');
  assert(manifest.splitMunicipalities[0] === '四日市市', 'Split municipality is Yokkaichi City');

  console.log('[Test BoundaryConfirmationGate] 2. Yokkaichi 4-point split risk check...');
  const yokkaichiCheck = manifest.analyzedMunicipalities.find(m => m.municipalityName === '四日市市');
  assert(!!yokkaichiCheck, 'Yokkaichi check entry exists');
  assert(yokkaichiCheck?.pattern === 'PATTERN_B_SPLIT', 'Yokkaichi is PATTERN_B_SPLIT');
  assert(yokkaichiCheck?.isMultiDistrict === true, 'Yokkaichi is Multi-District');
  assert(yokkaichiCheck?.isPartialBoundary === true, 'Yokkaichi has Partial Boundary');
  assert((yokkaichiCheck?.excludedSubdistricts?.length || 0) > 0, 'Excluded subdistrict list is generated');

  console.log('\n=================================================');
  console.log('  BOUNDARY CONFIRMATION GATE (STEP 0) PASSED');
  console.log('=================================================\n');
}

runBoundaryConfirmationGateTests();
