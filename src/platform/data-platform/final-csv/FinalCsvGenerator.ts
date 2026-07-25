import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AreaRecord } from '../schema/AreaSchema';
import { PostalSortEngine } from './PostalSortEngine';
import { MunicipalityGrouping } from './MunicipalityGrouping';
import { CsvSchemaValidator } from './CsvSchemaValidator';
import { CsvEvidenceGenerator, FinalCsvEvidence } from './CsvEvidenceGenerator';

export interface FinalCsvGeneratorResult {
  csvPath: string;
  sha256Path: string;
  csvContent: string;
  outputHash: string;
  recordCount: number;
  evidence: FinalCsvEvidence;
}

export class FinalCsvGenerator {
  public static generateFinalCsv(
    districtId: string,
    rawRecords: AreaRecord[],
    outputDir: string,
    logsDir: string
  ): FinalCsvGeneratorResult {
    // Rule 1: Postal Code Ascending Sort (PostalSortEngine)
    const sortedRecords = PostalSortEngine.sortAscending(rawRecords);

    // Rule 2: Validate Schema and Hashes
    const validationReport = CsvSchemaValidator.validateRecords(sortedRecords);
    if (!validationReport.isValid) {
      throw new Error(`[FinalCsvGenerator] CSV Schema Validation failed: ${validationReport.errors.join('; ')}`);
    }

    // Rule 3: Summarize Municipalities
    const municipalitySummaries = MunicipalityGrouping.summarizeGroups(sortedRecords);

    // Rule 4: Build CSV Content
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const csvFilename = `${districtId}_FINAL_VERIFIED_AREAS.csv`;
    const csvPath = path.join(outputDir, csvFilename);
    const sha256Path = path.join(outputDir, `${csvFilename}.sha256`);

    const header = 'area_id,district_id,prefecture,city,town,postal_code,municipality_code,source,generated_at,version,status,hash';
    const lines = [header];

    sortedRecords.forEach(r => {
      lines.push(
        `${r.areaId},${r.districtId},${r.prefecture},${r.city},${r.town},${r.postalCode},${r.municipalityCode},${r.source},${r.generatedAt},${r.version},${r.status},${r.hash}`
      );
    });

    const csvContent = lines.join('\n');
    fs.writeFileSync(csvPath, csvContent, 'utf8');

    // Rule 5: Calculate SHA-256 Output Hash
    const outputHash = crypto.createHash('sha256').update(csvContent).digest('hex');
    fs.writeFileSync(sha256Path, `${outputHash}  ${csvFilename}\n`, 'utf8');

    // Rule 6: Generate & Save Evidence Artifact
    const evidence = CsvEvidenceGenerator.generateAndSave(
      districtId,
      csvPath,
      outputHash,
      sortedRecords,
      municipalitySummaries,
      logsDir
    );

    return {
      csvPath,
      sha256Path,
      csvContent,
      outputHash,
      recordCount: sortedRecords.length,
      evidence
    };
  }
}
