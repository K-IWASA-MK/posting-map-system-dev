import * as fs from 'fs';
import * as path from 'path';
import { BoundAreaRecord, BoundaryMasterManifest, DistrictBoundaryDefinition } from '../boundary/BoundaryMasterFoundation';
import { AddressMasterRecord } from '../parser/NationalAddressHierarchyParser';

export interface BoundaryAccuracyReport {
  districtId: string;
  totalBoundRecords: number;
  municipalityInclusionStatus: 'ALL_MUNICIPALITIES_INCLUDED_PASS' | 'MUNICIPALITY_MISSING_FAIL';
  splitMunicipalityDiffStatus: 'SPLIT_DIFFERENCE_EXACT_PASS' | 'SPLIT_DIFFERENCE_MISMATCH_FAIL';
  unassignedAddressCount: number; // Must be 0
  dualAssignedCount: number;      // Must be 0
  verificationStatus: 'BOUNDARY_ACCURACY_VERIFICATION_PASS' | 'BOUNDARY_ACCURACY_VERIFICATION_FAIL';
  verifiedAt: string;
}

export class BoundaryMasterVerifier {
  public static verifyBoundaryMaster(
    boundaryManifest: BoundaryMasterManifest,
    boundRecords: BoundAreaRecord[],
    masterRecords: AddressMasterRecord[],
    boundaryDef: DistrictBoundaryDefinition,
    outputDir: string
  ): BoundaryAccuracyReport {
    console.log(`📌 [STEP 8] Running Boundary Master Accuracy Verification Engine for ${boundaryDef.districtId}...`);

    // 1. Municipality Inclusion Verification (Verify that all expected municipalities present in master appear in boundRecords)
    const expectedMunicipalities = new Set([
      ...boundaryDef.wholeMunicipalities,
      ...boundaryDef.splitMunicipalities.map(s => s.municipality)
    ]);

    const masterPresentMunicipalities = new Set(
      masterRecords
        .filter(r => r.prefecture === boundaryDef.prefecture && expectedMunicipalities.has(r.municipality))
        .map(r => r.municipality)
    );

    const boundMunicipalities = new Set(boundRecords.map(b => b.municipality));

    let municipalityInclusionStatus: 'ALL_MUNICIPALITIES_INCLUDED_PASS' | 'MUNICIPALITY_MISSING_FAIL' = 'ALL_MUNICIPALITIES_INCLUDED_PASS';
    masterPresentMunicipalities.forEach(m => {
      if (!boundMunicipalities.has(m)) {
        municipalityInclusionStatus = 'MUNICIPALITY_MISSING_FAIL';
      }
    });

    // 2. Split Municipality Difference Verification (Yokkaichi 2nd district vs 3rd district exclusion)
    let splitMunicipalityDiffStatus: 'SPLIT_DIFFERENCE_EXACT_PASS' | 'SPLIT_DIFFERENCE_MISMATCH_FAIL' = 'SPLIT_DIFFERENCE_EXACT_PASS';
    const splitDef = boundaryDef.splitMunicipalities.find(s => s.municipality === '四日市市');

    if (splitDef) {
      const yokkaichiBound = boundRecords.filter(b => b.municipality === '四日市市');
      const hasExcludedIntrusion = yokkaichiBound.some(b => {
        const fullAddr = `${b.addressLevel1} ${b.addressLevel2}`;
        return splitDef.excludedKeywords.some(ex => fullAddr.includes(ex));
      });

      if (hasExcludedIntrusion) {
        splitMunicipalityDiffStatus = 'SPLIT_DIFFERENCE_MISMATCH_FAIL';
      }
    }

    // 3. Unassigned Address Verification (No floating address within target municipalities)
    let unassignedAddressCount = 0;
    const targetMunicipalities = expectedMunicipalities;
    const masterTargetRecords = masterRecords.filter(r => r.prefecture === boundaryDef.prefecture && targetMunicipalities.has(r.municipality));

    const boundKeySet = new Set(boundRecords.map(b => `${b.prefecture}|${b.municipality}|${b.addressLevel1}|${b.addressLevel2}|${b.postalCode}`));

    masterTargetRecords.forEach(m => {
      // For split municipalities, check if it was intentionally excluded
      const splitDef = boundaryDef.splitMunicipalities.find(s => s.municipality === m.municipality);
      if (splitDef) {
        const fullAddr = `${m.addressLevel1} ${m.addressLevel2}`;
        const isExcluded = splitDef.excludedKeywords.some(ex => fullAddr.includes(ex));
        if (isExcluded) return; // Intentionally excluded to 2nd district
      }

      const key = `${m.prefecture}|${m.municipality}|${m.addressLevel1}|${m.addressLevel2}|${m.postalCode}`;
      if (!boundKeySet.has(key)) {
        unassignedAddressCount++;
      }
    });

    // 4. Dual Assignment Verification (No record assigned to multiple rules/districts)
    const seenBoundKeys = new Set<string>();
    let dualAssignedCount = 0;

    boundRecords.forEach(b => {
      const key = `${b.districtId}|${b.prefecture}|${b.municipality}|${b.addressLevel1}|${b.addressLevel2}|${b.postalCode}`;
      if (seenBoundKeys.has(key)) {
        dualAssignedCount++;
      } else {
        seenBoundKeys.add(key);
      }
    });

    const isPass = (
      municipalityInclusionStatus === 'ALL_MUNICIPALITIES_INCLUDED_PASS' &&
      splitMunicipalityDiffStatus === 'SPLIT_DIFFERENCE_EXACT_PASS' &&
      unassignedAddressCount === 0 &&
      dualAssignedCount === 0
    );

    const report: BoundaryAccuracyReport = {
      districtId: boundaryDef.districtId,
      totalBoundRecords: boundRecords.length,
      municipalityInclusionStatus,
      splitMunicipalityDiffStatus,
      unassignedAddressCount,
      dualAssignedCount,
      verificationStatus: isPass ? 'BOUNDARY_ACCURACY_VERIFICATION_PASS' : 'BOUNDARY_ACCURACY_VERIFICATION_FAIL',
      verifiedAt: new Date().toISOString()
    };

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, `boundary_accuracy_${boundaryDef.districtId}_report.json`), JSON.stringify(report, null, 2), 'utf8');

    console.log(`✅ [STEP 8 Verification Result] District: ${boundaryDef.districtId}, Inclusion: ${municipalityInclusionStatus}, SplitDiff: ${splitMunicipalityDiffStatus}, Unassigned: ${unassignedAddressCount}, DualAssigned: ${dualAssignedCount}, Status: ${report.verificationStatus}`);

    return report;
  }
}
