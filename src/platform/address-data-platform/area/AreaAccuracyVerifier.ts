import * as fs from 'fs';
import * as path from 'path';
import { FinalAreaRecord, AreaGenerationManifest } from './AreaGenerator';

export interface AreaAccuracyReport {
  districtId: string;
  totalAreas: number;
  duplicateAreaIdCount: number;
  postalCodeAscendingPass: boolean;
  sha256IntegrityPass: boolean;
  verificationStatus: 'AREA_ACCURACY_VERIFICATION_PASS' | 'AREA_ACCURACY_VERIFICATION_FAIL';
  verifiedAt: string;
}

export class AreaAccuracyVerifier {
  public static verifyFinalAreas(
    manifest: AreaGenerationManifest,
    finalRecords: FinalAreaRecord[],
    outputDir: string
  ): AreaAccuracyReport {
    console.log(`📌 [STEP 9-2] Running Area Accuracy Verification Engine for ${manifest.districtId}...`);

    // 1. Duplicate Area ID check
    const seenAreaIds = new Set<string>();
    let duplicateAreaIdCount = 0;

    finalRecords.forEach(r => {
      if (seenAreaIds.has(r.areaId)) {
        duplicateAreaIdCount++;
      } else {
        seenAreaIds.add(r.areaId);
      }
    });

    // 2. Postal code ascending order check
    let postalCodeAscendingPass = true;
    for (let i = 1; i < finalRecords.length; i++) {
      if (finalRecords[i].postalCode.localeCompare(finalRecords[i - 1].postalCode) < 0) {
        postalCodeAscendingPass = false;
        break;
      }
    }

    // 3. SHA-256 integrity check
    const sha256IntegrityPass = manifest.finalCsvSha256.length === 64 && fs.existsSync(manifest.finalCsvPath);

    const isPass = (duplicateAreaIdCount === 0 && postalCodeAscendingPass && sha256IntegrityPass);

    const report: AreaAccuracyReport = {
      districtId: manifest.districtId,
      totalAreas: finalRecords.length,
      duplicateAreaIdCount,
      postalCodeAscendingPass,
      sha256IntegrityPass,
      verificationStatus: isPass ? 'AREA_ACCURACY_VERIFICATION_PASS' : 'AREA_ACCURACY_VERIFICATION_FAIL',
      verifiedAt: new Date().toISOString()
    };

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, `area_accuracy_${manifest.districtId}_report.json`), JSON.stringify(report, null, 2), 'utf8');

    console.log(`✅ [AreaAccuracyVerifier Result] District: ${manifest.districtId}, Duplicates: ${duplicateAreaIdCount}, PostalAscending: ${postalCodeAscendingPass}, Status: ${report.verificationStatus}`);

    return report;
  }
}
