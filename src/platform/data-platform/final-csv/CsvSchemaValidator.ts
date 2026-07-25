import { AreaRecord } from '../schema/AreaSchema';

export interface CsvValidationReport {
  isValid: boolean;
  totalRecords: number;
  headerValid: boolean;
  duplicateHashesCount: number;
  errors: string[];
}

export class CsvSchemaValidator {
  private static readonly REQUIRED_HEADER = [
    'area_id', 'district_id', 'prefecture', 'city', 'town',
    'postal_code', 'municipality_code', 'source', 'generated_at', 'version', 'status', 'hash'
  ];

  public static validateRecords(records: AreaRecord[]): CsvValidationReport {
    const errors: string[] = [];
    const hashSet = new Set<string>();
    let duplicateHashesCount = 0;

    records.forEach((r, idx) => {
      if (!r.areaId) errors.push(`Line ${idx + 2}: Missing areaId`);
      if (!r.districtId) errors.push(`Line ${idx + 2}: Missing districtId`);
      if (!r.city) errors.push(`Line ${idx + 2}: Missing city`);
      if (!r.town) errors.push(`Line ${idx + 2}: Missing town`);
      if (!r.hash) errors.push(`Line ${idx + 2}: Missing SHA-256 hash`);

      if (hashSet.has(r.hash)) {
        duplicateHashesCount++;
      } else {
        hashSet.add(r.hash);
      }
    });

    return {
      isValid: errors.length === 0,
      totalRecords: records.length,
      headerValid: true,
      duplicateHashesCount,
      errors
    };
  }
}
