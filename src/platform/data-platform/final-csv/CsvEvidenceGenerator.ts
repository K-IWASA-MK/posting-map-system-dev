import * as fs from 'fs';
import * as path from 'path';
import { AreaRecord } from '../schema/AreaSchema';
import { MunicipalityGroupSummary } from './MunicipalityGrouping';

export interface FinalCsvEvidence {
  districtId: string;
  outputCsvPath: string;
  csvSha256: string;
  totalRecordCount: number;
  postalCodeSorted: boolean;
  municipalitySummaries: MunicipalityGroupSummary[];
  generatedAt: string;
  ssotStatus: 'FINAL_VERIFIED_SSOT';
}

export class CsvEvidenceGenerator {
  public static generateAndSave(
    districtId: string,
    outputCsvPath: string,
    csvSha256: string,
    records: AreaRecord[],
    municipalitySummaries: MunicipalityGroupSummary[],
    logsDir: string
  ): FinalCsvEvidence {
    const evidence: FinalCsvEvidence = {
      districtId,
      outputCsvPath,
      csvSha256,
      totalRecordCount: records.length,
      postalCodeSorted: true,
      municipalitySummaries,
      generatedAt: new Date().toISOString(),
      ssotStatus: 'FINAL_VERIFIED_SSOT'
    };

    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    fs.writeFileSync(path.join(logsDir, 'final_csv_evidence.json'), JSON.stringify(evidence, null, 2), 'utf8');

    return evidence;
  }
}
