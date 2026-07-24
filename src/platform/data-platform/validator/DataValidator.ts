import { AreaRecord, DistrictValidationProfile } from '../schema/AreaSchema';

export interface ValidationReport {
  passed: boolean;
  totalRecords: number;
  expectedCount: number;
  duplicateCount: number;
  nullFieldCount: number;
  errors: string[];
}

export class DataValidator {
  public validate(records: AreaRecord[], profile: DistrictValidationProfile): ValidationReport {
    const errors: string[] = [];
    const seenIds = new Set<string>();
    let duplicateCount = 0;
    let nullFieldCount = 0;

    if (records.length !== profile.expectedCount) {
      errors.push(
        `[Count Mismatch] Extracted records (${records.length}) does not match DistrictValidationProfile expected count (${profile.expectedCount}) for ${profile.districtId}.`
      );
    }

    records.forEach((rec, idx) => {
      if (seenIds.has(rec.areaId)) {
        duplicateCount++;
        errors.push(`[Duplicate ID] Duplicate area_id found at index ${idx}: ${rec.areaId}`);
      } else {
        seenIds.add(rec.areaId);
      }

      if (!rec.areaId || !rec.districtId || !rec.prefecture || !rec.city || !rec.town || !rec.postalCode) {
        nullFieldCount++;
        errors.push(`[Null Field] Missing required attribute at index ${idx} (areaId: ${rec.areaId})`);
      }

      if (rec.districtId !== profile.districtId) {
        errors.push(`[District Mismatch] Record districtId (${rec.districtId}) mismatch with profile (${profile.districtId})`);
      }
    });

    return {
      passed: errors.length === 0,
      totalRecords: records.length,
      expectedCount: profile.expectedCount,
      duplicateCount,
      nullFieldCount,
      errors
    };
  }
}
