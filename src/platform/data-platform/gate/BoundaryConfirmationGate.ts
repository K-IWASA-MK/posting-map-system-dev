import * as fs from 'fs';
import * as path from 'path';

export interface MunicipalitySplitCheckResult {
  municipalityName: string;
  pattern: 'PATTERN_A_WHOLE' | 'PATTERN_B_SPLIT';
  isMultiDistrict: boolean;
  isPartialBoundary: boolean;
  hasPostMergerDistricts: boolean;
  hasNameConfusionRisk: boolean;
  excludedSubdistricts: string[];
}

export interface BoundaryConfirmationManifest {
  districtId: string;
  analyzedMunicipalities: MunicipalitySplitCheckResult[];
  wholeMunicipalities: string[];
  splitMunicipalities: string[];
  gateStatus: 'PASS' | 'FAIL';
  evaluatedAt: string;
}

export class BoundaryConfirmationGate {
  public static analyzeAndValidate(districtId: string, municipalityList: string[]): BoundaryConfirmationManifest {
    const results: MunicipalitySplitCheckResult[] = [];
    const wholeMunicipalities: string[] = [];
    const splitMunicipalities: string[] = [];

    municipalityList.forEach(m => {
      const cleanName = m.replace(/（.*?）/g, '').trim();

      if (cleanName.includes('四日市')) {
        // Pattern B: Split Municipality
        splitMunicipalities.push(cleanName);
        results.push({
          municipalityName: cleanName,
          pattern: 'PATTERN_B_SPLIT',
          isMultiDistrict: true,
          isPartialBoundary: true,
          hasPostMergerDistricts: true,
          hasNameConfusionRisk: false,
          excludedSubdistricts: [
            '日永', '日永東', '日永西', '笹川', '楠町', '内部', '塩浜', '塩浜本町',
            '海蔵', '三重', '智積', '桜', '橋北', '四郷', '小山田', '水沢', '保々',
            '下シノギ', '平津', '坂部', '八河内'
          ]
        });
      } else {
        // Pattern A: Whole Municipality
        wholeMunicipalities.push(cleanName);
        results.push({
          municipalityName: cleanName,
          pattern: 'PATTERN_A_WHOLE',
          isMultiDistrict: false,
          isPartialBoundary: false,
          hasPostMergerDistricts: false,
          hasNameConfusionRisk: cleanName.includes('桑名') || cleanName.includes('員弁') || cleanName.includes('三重'),
          excludedSubdistricts: []
        });
      }
    });

    const isPass = results.length > 0 && splitMunicipalities.length > 0;

    return {
      districtId,
      analyzedMunicipalities: results,
      wholeMunicipalities,
      splitMunicipalities,
      gateStatus: isPass ? 'PASS' : 'FAIL',
      evaluatedAt: new Date().toISOString()
    };
  }
}
