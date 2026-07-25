import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { BoundAreaRecord, BoundaryMasterManifest } from '../boundary/BoundaryMasterFoundation';
import { BoundaryAccuracyReport } from '../verifier/BoundaryMasterVerifier';

export interface FinalAreaRecord {
  areaId: string;
  districtId: string;
  prefecture: string;
  city: string;
  town: string;
  postalCode: string;
  municipalityCode: string;
  source: string;
  generatedAt: string;
  version: string;
  status: 'ACTIVE';
  hash: string;
}

export interface AreaGenerationManifest {
  manifestId: string;
  districtId: string;
  boundaryManifestId: string;
  totalAreas: number;
  finalCsvPath: string;
  finalCsvSha256: string;
  generatedAt: string;
  status: 'FINAL_AREA_GENERATED';
}

export class AreaGenerator {
  /**
   * Run STEP 9-1: POSTING MAP Area Generation Engine
   * Constructs deterministic area records sorted in ascending postal code order.
   */
  public static generateFinalAreas(
    boundaryManifest: BoundaryMasterManifest,
    boundaryReport: BoundaryAccuracyReport,
    boundRecords: BoundAreaRecord[],
    outputDir: string
  ): { finalRecords: FinalAreaRecord[]; manifest: AreaGenerationManifest } {
    console.log(`📌 [STEP 9] Running Area Generation Engine for ${boundaryManifest.districtId}...`);

    if (boundaryReport.verificationStatus !== 'BOUNDARY_ACCURACY_VERIFICATION_PASS') {
      throw new Error(`[AreaGenerator] BLOCKED. Boundary Master is not verified.`);
    }

    // Sort bound records by postal code ascending
    const sortedBounds = [...boundRecords].sort((a, b) => a.postalCode.localeCompare(b.postalCode));

    const nowStr = new Date().toISOString().split('T')[0];
    const prefix = boundaryManifest.districtId.replace('-', '');
    const finalRecords: FinalAreaRecord[] = [];

    sortedBounds.forEach((b, i) => {
      const areaSeq = i + 1;
      const areaId = `${prefix}-${String(areaSeq).padStart(6, '0')}`;
      const townStr = b.addressLevel2 !== 'NULL' ? `${b.addressLevel1}${b.addressLevel2}` : b.addressLevel1;

      const recordWithoutHash = {
        areaId,
        districtId: b.districtId,
        prefecture: b.prefecture,
        city: b.municipality,
        town: townStr,
        postalCode: b.postalCode,
        municipalityCode: '24200',
        source: 'NATIONAL_ADDRESS_PLATFORM_V3',
        generatedAt: nowStr,
        version: '2026-07',
        status: 'ACTIVE' as const
      };

      const payload = `${areaId}|${b.districtId}|${b.prefecture}|${b.municipality}|${townStr}|${b.postalCode}|2026-07`;
      const hash = crypto.createHash('sha256').update(payload).digest('hex');

      finalRecords.push({
        ...recordWithoutHash,
        hash
      });
    });

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const finalCsvPath = path.join(outputDir, `${boundaryManifest.districtId}_FINAL_VERIFIED_AREAS.csv`);

    const header = 'area_id,district_id,prefecture,city,town,postal_code,municipality_code,source,generated_at,version,status,hash';
    const lines = [header];

    finalRecords.forEach(f => {
      lines.push(`${f.areaId},${f.districtId},${f.prefecture},${f.city},${f.town},${f.postalCode},${f.municipalityCode},${f.source},${f.generatedAt},${f.version},${f.status},${f.hash}`);
    });

    const csvContent = lines.join('\n');
    fs.writeFileSync(finalCsvPath, csvContent, 'utf8');

    const finalCsvSha256 = crypto.createHash('sha256').update(csvContent).digest('hex');

    const manifest: AreaGenerationManifest = {
      manifestId: `AREA-GEN-${boundaryManifest.districtId}-${finalCsvSha256.substring(0, 10).toUpperCase()}`,
      districtId: boundaryManifest.districtId,
      boundaryManifestId: boundaryManifest.manifestId,
      totalAreas: finalRecords.length,
      finalCsvPath,
      finalCsvSha256,
      generatedAt: new Date().toISOString(),
      status: 'FINAL_AREA_GENERATED'
    };

    fs.writeFileSync(path.join(outputDir, `area_generation_${boundaryManifest.districtId}_manifest.json`), JSON.stringify(manifest, null, 2), 'utf8');

    console.log(`✅ [AreaGenerator] PASS! District: ${boundaryManifest.districtId}, Total Areas: ${finalRecords.length}, CSV Output: ${finalCsvPath}`);

    return { finalRecords, manifest };
  }
}
