import * as crypto from 'crypto';

export interface AreaRecord {
  areaId: string;           // "MIE03-000001"
  districtId: string;       // "MIE-03"
  prefecture: string;       // "三重県"
  city: string;             // "桑名市"
  town: string;             // "大字桑名"
  postalCode: string;       // "511-0000"
  municipalityCode: string; // "24205"
  source: string;           // "POSTAL+ADMIN"
  generatedAt: string;      // "2026-07-24"
  version: string;          // "v1"
  status: 'GENERATED' | 'VALIDATED' | 'ACCURACY_CHECKED' | 'AUDITED' | 'CEO_APPROVED' | 'FROZEN';
  hash: string;             // SHA-256 Record Hash
}

export interface DistrictValidationProfile {
  districtId: string;
  districtName: string;
  prefecture: string;
  expectedCount: number;
  source: string;
  version: string;
}

export interface DataPlatformEvidence {
  pipeline: string;
  district: string;
  inputHash: string;
  outputHash: string;
  recordCount: number;
  validation: string;
  generatedBy: string;
  timestamp: string;
  details: {
    expectedCount: number;
    matchedCount: number;
    duplicatedCount: number;
    profileVersion: string;
  };
}

export interface ExtractionValidationResult {
  districtId: string;
  extractedCount: number;
  expectedCount: number;
  isCountMatched: boolean;
  hasRequiredFields: boolean;
  hasUniqueAreaIds: boolean;
  hasValidPostalFormat: boolean;
  validationStatus: 'PASS' | 'FAIL';
  errors: string[];
  manifest: {
    recordCount: number;
    generatedAt: string;
    sha256: string;
    profileVersion: string;
  };
}

export const MIE03_VALIDATION_PROFILE: DistrictValidationProfile = {
  districtId: 'MIE-03',
  districtName: '三重第3区',
  prefecture: '三重県',
  expectedCount: 684,
  source: '行政区割りデータ (三重県選挙区区割り.csv)',
  version: '2026-07'
};

export function calculateRecordHash(record: Omit<AreaRecord, 'hash'>): string {
  const payload = `${record.areaId}|${record.districtId}|${record.prefecture}|${record.city}|${record.town}|${record.postalCode}|${record.municipalityCode}|${record.version}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}
