import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AreaRecord, DistrictValidationProfile, DataPlatformEvidence, MIE03_VALIDATION_PROFILE } from '../schema/AreaSchema';
import { RawDataPreserver } from '../integrity/RawDataPreserver';
import { DistrictExtractor } from '../extractor/DistrictExtractor';
import { DataValidator, ValidationReport } from '../validator/DataValidator';

export interface PipelineOptions {
  profile?: DistrictValidationProfile;
  referenceDir?: string;
  outputDir?: string;
  logsDir?: string;
  generatedBy?: string;
}

export class DataPlatformPipeline {
  private preserver: RawDataPreserver;
  private extractor: DistrictExtractor;
  private validator: DataValidator;

  constructor() {
    this.preserver = new RawDataPreserver();
    this.extractor = new DistrictExtractor();
    this.validator = new DataValidator();
  }

  public run(options: PipelineOptions = {}): {
    evidence: DataPlatformEvidence;
    report: ValidationReport;
    csvPath: string;
  } {
    const profile = options.profile || MIE03_VALIDATION_PROFILE;
    const referenceDir = options.referenceDir || path.join(__dirname, '../../../../projects/posting-map/reference');
    const branchDir = path.join(__dirname, '../../../../FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区');
    const outputDir = options.outputDir || path.join(branchDir, 'output');
    const logsDir = options.logsDir || path.join(branchDir, 'logs');
    const generatedBy = options.generatedBy || 'DistrictInitializationAgent';

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    // Step 1: Preserve Raw Sources & Calculate Input Hash
    const districtCsvPath = path.join(referenceDir, '三重県選挙区区割り.csv');
    const postalCsvPath = path.join(referenceDir, 'postal.csv');

    if (fs.existsSync(districtCsvPath)) this.preserver.registerAndPreserve(districtCsvPath);
    if (fs.existsSync(postalCsvPath)) this.preserver.registerAndPreserve(postalCsvPath);

    const inputHash = this.preserver.getCombinedInputHash();

    // Step 2: Extract District Records
    const records: AreaRecord[] = this.extractor.extractDistrictAreas(profile, referenceDir);

    // Step 3: Validate Records
    const report = this.validator.validate(records, profile);

    // Step 4: Generate SSOT Final Verified CSV
    const csvFilename = `${profile.districtId}_FINAL_VERIFIED_AREAS.csv`;
    const csvPath = path.join(outputDir, csvFilename);
    const sha256Path = path.join(outputDir, `${csvFilename}.sha256`);

    const csvHeader = 'area_id,district_id,prefecture,city,town,postal_code,municipality_code,source,generated_at,version,status,hash';
    const csvLines = [csvHeader];

    records.forEach(r => {
      csvLines.push(
        `${r.areaId},${r.districtId},${r.prefecture},${r.city},${r.town},${r.postalCode},${r.municipalityCode},${r.source},${r.generatedAt},${r.version},${r.status},${r.hash}`
      );
    });

    const csvContent = csvLines.join('\n');
    fs.writeFileSync(csvPath, csvContent, 'utf8');

    // Calculate Output Hash
    const outputHash = crypto.createHash('sha256').update(csvContent).digest('hex');
    fs.writeFileSync(sha256Path, `${outputHash}  ${csvFilename}\n`, 'utf8');

    // Step 5: Generate AIOS Runtime Evidence
    const evidence: DataPlatformEvidence = {
      pipeline: 'DataPlatformFoundation',
      district: profile.districtId,
      inputHash,
      outputHash,
      recordCount: records.length,
      validation: report.passed ? 'PASS' : 'FAIL',
      generatedBy,
      timestamp: new Date().toISOString(),
      details: {
        expectedCount: profile.expectedCount,
        matchedCount: records.length,
        duplicatedCount: report.duplicateCount,
        profileVersion: profile.version
      }
    };

    const evidencePath = path.join(logsDir, 'data_platform_runtime_evidence.json');
    fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2), 'utf8');

    // Local platform sync copy to ensure SSOT is directly accessible
    const localPlatformOutputDir = path.join(__dirname, '../output');
    const localPlatformLogsDir = path.join(__dirname, '../evidence');
    if (!fs.existsSync(localPlatformOutputDir)) fs.mkdirSync(localPlatformOutputDir, { recursive: true });
    if (!fs.existsSync(localPlatformLogsDir)) fs.mkdirSync(localPlatformLogsDir, { recursive: true });

    fs.writeFileSync(path.join(localPlatformOutputDir, csvFilename), csvContent, 'utf8');
    fs.writeFileSync(path.join(localPlatformLogsDir, 'runtime_evidence.json'), JSON.stringify(evidence, null, 2), 'utf8');

    return {
      evidence,
      report,
      csvPath
    };
  }
}

if (require.main === module) {
  console.log('🚀 Running DataPlatformPipeline directly...');
  const pipeline = new DataPlatformPipeline();
  const result = pipeline.run();
  console.log('✅ Pipeline Execution Complete!');
  console.log('Evidence:', JSON.stringify(result.evidence, null, 2));
}
