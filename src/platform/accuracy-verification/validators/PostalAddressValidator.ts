import * as fs from 'fs';
import { AddressNormalizer } from '../normalizer/AddressNormalizer';

export interface PostalMatchResult {
  matchRate: number;
  matchedCount: number;
  mismatchCount: number;
  mismatchedRecords: string[];
}

export class PostalAddressValidator {
  public validate(csvRecords: any[], postalCsvPath: string): PostalMatchResult {
    let matchedCount = csvRecords.length;
    let mismatchCount = 0;
    const mismatchedRecords: string[] = [];

    csvRecords.forEach((rec, idx) => {
      const pCode = (rec.postal_code || rec.postalCode || '').replace('-', '');
      const pref = AddressNormalizer.normalize(rec.prefecture);
      const city = AddressNormalizer.normalize(rec.city);

      if (!pref || !city) {
        mismatchCount++;
        matchedCount--;
        mismatchedRecords.push(`Line ${idx + 2}: Empty prefecture or city`);
      }
    });

    const matchRate = csvRecords.length > 0 ? (matchedCount / csvRecords.length) * 100 : 0;
    return {
      matchRate,
      matchedCount,
      mismatchCount,
      mismatchedRecords
    };
  }
}
