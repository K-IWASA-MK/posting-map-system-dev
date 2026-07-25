import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AddressMasterRecord } from '../parser/NationalAddressHierarchyParser';
import { AddressMasterReleaseManifest } from '../gate/AddressMasterReleaseGate';

export interface DistrictBoundaryDefinition {
  districtId: string;
  districtName: string;
  prefecture: string;
  wholeMunicipalities: string[]; // Pattern A
  splitMunicipalities: Array<{   // Pattern B
    municipality: string;
    includedKeywords: string[];
    excludedKeywords: string[];
  }>;
}

export interface BoundAreaRecord {
  districtId: string;
  prefecture: string;
  municipality: string;
  addressLevel1: string;
  addressLevel2: string;
  postalCode: string;
  patternRule: 'PATTERN_A_WHOLE' | 'PATTERN_B_SPLIT_INCLUDED';
  hash: string;
}

export interface BoundaryMasterManifest {
  manifestId: string;
  districtId: string;
  releasedMasterManifestId: string;
  boundRecordCount: number;
  patternAWholeCount: number;
  patternBSplitCount: number;
  boundaryMasterHash: string;
  generatedAt: string;
  status: 'BOUNDARY_MASTER_READY';
}

export class BoundaryMasterFoundation {
  /**
   * Run STEP 7: Boundary Master Foundation (Overlay RELEASED ADDRESS_MASTER with District Boundary Definition)
   */
  public static overlayBoundaryMaster(
    releaseManifest: AddressMasterReleaseManifest,
    masterRecords: AddressMasterRecord[],
    boundaryDef: DistrictBoundaryDefinition,
    outputDir: string
  ): { boundRecords: BoundAreaRecord[]; manifest: BoundaryMasterManifest } {
    console.log(`📌 [STEP 7] Running Boundary Master Foundation for ${boundaryDef.districtId}...`);

    if (releaseManifest.currentState !== 'RELEASED') {
      throw new Error(`[BoundaryMasterFoundation] BLOCKED. ADDRESS_MASTER is not in RELEASED state.`);
    }

    const boundRecords: BoundAreaRecord[] = [];
    let patternAWholeCount = 0;
    let patternBSplitCount = 0;

    masterRecords.forEach(r => {
      if (r.prefecture !== boundaryDef.prefecture) return;

      // 1. Check Pattern A: Whole Municipalities
      if (boundaryDef.wholeMunicipalities.includes(r.municipality)) {
        patternAWholeCount++;
        const payload = `${boundaryDef.districtId}|${r.prefecture}|${r.municipality}|${r.addressLevel1}|${r.addressLevel2}|${r.postalCode}|PATTERN_A_WHOLE`;
        boundRecords.push({
          districtId: boundaryDef.districtId,
          prefecture: r.prefecture,
          municipality: r.municipality,
          addressLevel1: r.addressLevel1,
          addressLevel2: r.addressLevel2,
          postalCode: r.postalCode,
          patternRule: 'PATTERN_A_WHOLE',
          hash: crypto.createHash('sha256').update(payload).digest('hex')
        });
        return;
      }

      // 2. Check Pattern B: Split Municipalities
      const splitDef = boundaryDef.splitMunicipalities.find(s => s.municipality === r.municipality);
      if (splitDef) {
        const fullAddr = `${r.addressLevel1} ${r.addressLevel2}`;
        const isExcluded = splitDef.excludedKeywords.some(kw => fullAddr.includes(kw));
        const isIncluded = splitDef.includedKeywords.some(kw => fullAddr.includes(kw)) || !isExcluded;

        if (isIncluded && !isExcluded) {
          patternBSplitCount++;
          const payload = `${boundaryDef.districtId}|${r.prefecture}|${r.municipality}|${r.addressLevel1}|${r.addressLevel2}|${r.postalCode}|PATTERN_B_SPLIT_INCLUDED`;
          boundRecords.push({
            districtId: boundaryDef.districtId,
            prefecture: r.prefecture,
            municipality: r.municipality,
            addressLevel1: r.addressLevel1,
            addressLevel2: r.addressLevel2,
            postalCode: r.postalCode,
            patternRule: 'PATTERN_B_SPLIT_INCLUDED',
            hash: crypto.createHash('sha256').update(payload).digest('hex')
          });
        }
      }
    });

    // Write BOUNDARY_MASTER_BOUND_AREAS.csv
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const csvPath = path.join(outputDir, `BOUNDARY_MASTER_${boundaryDef.districtId}.csv`);
    const header = 'district_id,prefecture,municipality,address_level_1,address_level_2,postal_code,pattern_rule,hash';
    const lines = [header];

    boundRecords.forEach(b => {
      lines.push(`${b.districtId},${b.prefecture},${b.municipality},${b.addressLevel1},${b.addressLevel2},${b.postalCode},${b.patternRule},${b.hash}`);
    });

    const csvContent = lines.join('\n');
    fs.writeFileSync(csvPath, csvContent, 'utf8');

    const boundaryMasterHash = crypto.createHash('sha256').update(csvContent).digest('hex');

    const manifest: BoundaryMasterManifest = {
      manifestId: `BM-FOUNDATION-${boundaryDef.districtId}-${boundaryMasterHash.substring(0, 10).toUpperCase()}`,
      districtId: boundaryDef.districtId,
      releasedMasterManifestId: releaseManifest.manifestId,
      boundRecordCount: boundRecords.length,
      patternAWholeCount,
      patternBSplitCount,
      boundaryMasterHash,
      generatedAt: new Date().toISOString(),
      status: 'BOUNDARY_MASTER_READY'
    };

    fs.writeFileSync(path.join(outputDir, `boundary_master_${boundaryDef.districtId}_manifest.json`), JSON.stringify(manifest, null, 2), 'utf8');

    console.log(`✅ [BoundaryMasterFoundation] PASS! District: ${boundaryDef.districtId}, Bound Records: ${boundRecords.length} (Pattern A: ${patternAWholeCount}, Pattern B: ${patternBSplitCount})`);

    return { boundRecords, manifest };
  }
}
