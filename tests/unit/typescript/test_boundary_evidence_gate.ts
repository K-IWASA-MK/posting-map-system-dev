import { DistrictBoundaryResolver } from '../../../src/platform/data-platform/resolver/DistrictBoundaryResolver';
import { BoundaryEvidenceGate } from '../../../src/platform/data-platform/gate/BoundaryEvidenceGate';
import * as path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runBoundaryEvidenceGateTests() {
  console.log('[Test BoundaryEvidenceGate] Starting STEP 1.5 Boundary Evidence Gate tests...');

  const branchDir = path.join(__dirname, '../../../FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区');
  const resolver = new DistrictBoundaryResolver();
  const boundaryEvidence = resolver.resolveDistrictBoundary('MIE-03', branchDir);

  const gateResult = BoundaryEvidenceGate.verifyAndGenerateProof(boundaryEvidence);

  console.log('[Test BoundaryEvidenceGate] 1. Proof structure check...');
  assert(gateResult.districtId === 'MIE-03', 'District ID is MIE-03');
  assert(gateResult.gateStatus === 'PASS', 'Gate status is PASS');
  assert(gateResult.proofs.length === 1, '1 split municipality proof generated (Yokkaichi City)');

  const yokkaichiProof = gateResult.proofs[0];
  assert(yokkaichiProof.municipality === '四日市市', 'Municipality is Yokkaichi City');
  assert(yokkaichiProof.boundaryVerified === true, 'Boundary is verified true');
  assert(yokkaichiProof.includedAreas.length > 0, 'Included areas list is populated');
  assert(yokkaichiProof.excludedAreas.length > 0, 'Excluded areas list is populated');

  console.log('\n=================================================');
  console.log('  BOUNDARY EVIDENCE GATE (STEP 1.5) PASSED');
  console.log('=================================================\n');
}

runBoundaryEvidenceGateTests();
