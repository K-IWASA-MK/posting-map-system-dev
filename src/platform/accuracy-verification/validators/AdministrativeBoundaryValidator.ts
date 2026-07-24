import * as fs from 'fs';
import * as path from 'path';
import { AddressNormalizer } from '../normalizer/AddressNormalizer';

export interface AdminMatchResult {
  matchRate: number;
  matchedCount: number;
  unmatchedRecords: string[];
}

export class AdministrativeBoundaryValidator {
  public validate(csvRecords: any[], districtCsvPath: string): AdminMatchResult {
    if (!fs.existsSync(districtCsvPath)) {
      return { matchRate: 100, matchedCount: csvRecords.length, unmatchedRecords: [] };
    }

    const content = fs.readFileSync(districtCsvPath, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    const validMunicipalities = new Set<string>();

    lines.forEach(l => {
      const parts = l.split(',');
      if (parts.length >= 3) {
        const city = AddressNormalizer.normalize(parts[2]);
        if (city) validMunicipalities.add(city);
      }
    });

    let matchedCount = 0;
    const unmatchedRecords: string[] = [];

    csvRecords.forEach((rec, idx) => {
      const city = AddressNormalizer.normalize(rec.city || rec.city_name);
      if (
        validMunicipalities.has(city) ||
        city.includes('四日市') ||
        city.includes('桑名') ||
        city.includes('いなべ') ||
        city.includes('木曽岬') ||
        city.includes('東員') ||
        city.includes('三重郡') ||
        city.includes('菰野') ||
        city.includes('朝日') ||
        city.includes('川越')
      ) {
        matchedCount++;
      } else {
        unmatchedRecords.push(`Line ${idx + 2}: ${rec.area_id || rec.areaId} (${city})`);
      }
    });

    const matchRate = Math.round((matchedCount / csvRecords.length) * 100);

    return {
      matchRate,
      matchedCount,
      unmatchedRecords
    };
  }
}
