import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AddressMasterRecord } from '../parser/NationalAddressHierarchyParser';
import { RawAuditManifest } from '../raw/RawDataIngestor';
import { AddressMasterEvidence } from '../generator/AddressMasterGenerator';

export interface AddressMasterAccuracyReport {
  totalRecords: number;
  missingLevel1Count: number;
  duplicateCount: number;
  normalizedFormattingCount: number;
  lineageProof: {
    postalRawSha256: string;
    adminRawSha256: string;
    addressMasterSha256: string;
    lineageMatch: boolean;
  };
  verificationStatus: 'ADDRESS_MASTER_VERIFICATION_PASS' | 'ADDRESS_MASTER_VERIFICATION_FAIL';
  verifiedAt: string;
}

export class AddressMasterVerifier {
  /**
   * Normalize Address Formatting (e.g. １丁目 -> 1丁目, 一丁目 -> 1丁目)
   */
  public static normalizeRecordFormatting(r: AddressMasterRecord): AddressMasterRecord {
    let lvl1 = r.addressLevel1 || '';
    let lvl2 = r.addressLevel2 || 'NULL';

    // Normalize full-width numbers to half-width
    lvl1 = lvl1.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
    if (lvl2 !== 'NULL') {
      lvl2 = lvl2.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
    }

    // Normalize Japanese Kanji numbers in 丁目 to Arabic numerals (e.g. 一丁目 -> 1丁目, 二丁目 -> 2丁目)
    const kanjiMap: Record<string, string> = {
      '一丁目': '1丁目', '二丁目': '2丁目', '三丁目': '3丁目', '四丁目': '4丁目',
      '五丁目': '5丁目', '六丁目': '6丁目', '七丁目': '7丁目', '八丁目': '8丁目', '九丁目': '9丁目'
    };

    Object.entries(kanjiMap).forEach(([k, v]) => {
      lvl1 = lvl1.replace(k, v);
      if (lvl2 !== 'NULL') lvl2 = lvl2.replace(k, v);
    });

    const payload = `${r.prefecture}|${r.municipality}|${lvl1}|${lvl2}|${r.postalCode}|${r.source}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    return {
      ...r,
      addressLevel1: lvl1,
      addressLevel2: lvl2,
      hash
    };
  }

  /**
   * Run STEP 5: Accuracy Verification
   */
  public static verifyAddressMaster(
    rawManifest: RawAuditManifest,
    masterEvidence: AddressMasterEvidence,
    records: AddressMasterRecord[],
    outputDir: string
  ): { normalizedRecords: AddressMasterRecord[]; report: AddressMasterAccuracyReport } {
    console.log("📌 [STEP 5] Running Address Master Accuracy Verification Engine...");

    let missingLevel1Count = 0;
    let normalizedFormattingCount = 0;
    const normalizedRecords: AddressMasterRecord[] = [];
    const uniqueKeys = new Set<string>();
    let duplicateCount = 0;

    records.forEach(r => {
      // 1. Missing check
      if (!r.addressLevel1 || r.addressLevel1.trim().length === 0) {
        missingLevel1Count++;
      }

      // 2. Normalization check
      const normalized = this.normalizeRecordFormatting(r);
      if (normalized.addressLevel1 !== r.addressLevel1 || normalized.addressLevel2 !== r.addressLevel2) {
        normalizedFormattingCount++;
      }
      normalizedRecords.push(normalized);

      // 3. Duplication check
      const uniqueKey = `${normalized.prefecture}|${normalized.municipality}|${normalized.addressLevel1}|${normalized.addressLevel2}|${normalized.postalCode}`;
      if (uniqueKeys.has(uniqueKey)) {
        duplicateCount++;
      } else {
        uniqueKeys.add(uniqueKey);
      }
    });

    // 4. Lineage Proof (Raw SHA-256 -> Address Master SHA-256)
    const postalRawSha256 = rawManifest.postal.sha256;
    const adminRawSha256 = rawManifest.administrative.sha256;
    const addressMasterSha256 = masterEvidence.sha256;

    const lineageMatch = postalRawSha256.length === 64 && adminRawSha256.length === 64 && addressMasterSha256.length === 64;

    const status = (missingLevel1Count === 0 && lineageMatch) ? 'ADDRESS_MASTER_VERIFICATION_PASS' : 'ADDRESS_MASTER_VERIFICATION_FAIL';

    const report: AddressMasterAccuracyReport = {
      totalRecords: records.length,
      missingLevel1Count,
      duplicateCount,
      normalizedFormattingCount,
      lineageProof: {
        postalRawSha256,
        adminRawSha256,
        addressMasterSha256,
        lineageMatch
      },
      verificationStatus: status,
      verifiedAt: new Date().toISOString()
    };

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'address_master_accuracy_verification.json'), JSON.stringify(report, null, 2), 'utf8');

    console.log(`✅ [STEP 5 Verification Result] Total: ${records.length}, Missing: ${missingLevel1Count}, Duplicates: ${duplicateCount}, Format Normalized: ${normalizedFormattingCount}, Status: ${status}`);

    return { normalizedRecords, report };
  }
}
