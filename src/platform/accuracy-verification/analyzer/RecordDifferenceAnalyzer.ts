export interface DifferenceAnalysisResult {
  missingCount: number;
  extraCount: number;
  missingRecords: string[];
  extraRecords: string[];
  isZeroDifference: boolean;
}

export class RecordDifferenceAnalyzer {
  public analyze(csvRecords: any[], expectedCount: number): DifferenceAnalysisResult {
    const missingRecords: string[] = [];
    const extraRecords: string[] = [];

    if (csvRecords.length < expectedCount) {
      const diff = expectedCount - csvRecords.length;
      for (let i = 0; i < diff; i++) {
        missingRecords.push(`Missing area record index ${csvRecords.length + i + 1}`);
      }
    } else if (csvRecords.length > expectedCount) {
      const diff = csvRecords.length - expectedCount;
      for (let i = 0; i < diff; i++) {
        extraRecords.push(`Unexpected extra record area_id: ${csvRecords[expectedCount + i]?.area_id || 'UNKNOWN'}`);
      }
    }

    return {
      missingCount: missingRecords.length,
      extraCount: extraRecords.length,
      missingRecords,
      extraRecords,
      isZeroDifference: missingRecords.length === 0 && extraRecords.length === 0
    };
  }
}
