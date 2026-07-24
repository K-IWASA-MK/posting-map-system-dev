import * as crypto from 'crypto';

export interface DistrictValidationProfile {
  districtId: string;
  districtName: string;
  prefecture: string;
  expectedCount: number;
  source: string;
  version: string;
}

export interface AreaRecord {
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
  status: 'DRAFT' | 'VERIFIED' | 'FROZEN';
  hash: string;
}

export interface DataPlatformEvidence {
  pipeline: string;
  district: string;
  inputHash: string;
  outputHash: string;
  recordCount: number;
  validation: 'PASS' | 'FAIL';
  generatedBy: string;
  timestamp: string;
  details?: {
    expectedCount: number;
    matchedCount: number;
    duplicatedCount: number;
    profileVersion: string;
  };
}

export const MIE03_VALIDATION_PROFILE: DistrictValidationProfile = {
  districtId: 'MIE-03',
  districtName: '三重第3区',
  prefecture: '三重県',
  expectedCount: 651,
  source: '行政区割りデータ (三重県選挙区区割り.csv)',
  version: '2026-07'
};

export function calculateRecordHash(record: Omit<AreaRecord, 'hash'>): string {
  const payload = `${record.areaId}|${record.districtId}|${record.prefecture}|${record.city}|${record.town}|${record.postalCode}|${record.municipalityCode}|${record.version}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}
