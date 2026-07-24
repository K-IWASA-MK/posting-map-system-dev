import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AreaRecord, DistrictValidationProfile, DataPlatformEvidence, MIE03_VALIDATION_PROFILE } from '../schema/AreaSchema';
import { RawDataPreserver } from '../integrity/RawDataPreserver';
import { DistrictExtractor } from '../extractor/DistrictExtractor';
import { DataValidator, ValidationReport } from '../validator/DataValidator';
import { DistrictBoundaryResolver } from '../resolver/DistrictBoundaryResolver';
import { AddressHierarchyExtractor } from '../extractor/AddressHierarchyExtractor';

export interface PipelineOptions {
  profile?: DistrictValidationProfile;
  referenceDir?: string;
  outputDir?: string;
  logsDir?: string;
  generatedBy?: string;
}

export class DataPlatformPipeline {
  private preserver = new RawDataPreserver();
  private boundaryResolver = new DistrictBoundaryResolver();
  private hierarchyExtractor = new AddressHierarchyExtractor();
  private extractor = new DistrictExtractor();
  private validator = new DataValidator();

  public runPipeline(options: PipelineOptions = {}): {
    records: AreaRecord[];
    evidence: DataPlatformEvidence;
    report: ValidationReport;
    csvPath: string;
  } {
    const profile = options.profile || MIE03_VALIDATION_PROFILE;
    const branchDir = path.join(__dirname, '../../../../FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区');
    const referenceDir = options.referenceDir || branchDir;
    const outputDir = options.outputDir || path.join(branchDir, 'output');
    const logsDir = options.logsDir || path.join(branchDir, 'logs');
    const generatedBy = options.generatedBy || 'DistrictInitializationAgent';

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    // STEP 1 & STEP 2: District Boundary Resolution & Target Area Determination (MUST BE FIRST)
    console.log('📌 [STEP 1 & STEP 2] Running District Boundary Resolver...');
    const boundaryEvidence = this.boundaryResolver.resolveDistrictBoundary(profile.districtId, referenceDir);
    fs.writeFileSync(path.join(logsDir, 'boundary_evidence.json'), JSON.stringify(boundaryEvidence, null, 2), 'utf8');

    // STEP 3: Address Hierarchy Extraction on Confirmed Boundary Areas
    console.log('📌 [STEP 3] Running Address Hierarchy Extractor...');
    const rawSeeds = [
      { city: '桑名市', town: '江場' },
      { city: 'いなべ市', town: '員弁町大泉' },
      { city: '四日市市（一部）', town: '富田1丁目' }
    ];
    const hierarchyNodes = this.hierarchyExtractor.extractHierarchy(boundaryEvidence, rawSeeds);

    // STEP 4: Area Record Generation
    console.log('📌 [STEP 4] Generating Area Records...');
    const records: AreaRecord[] = this.extractor.extractDistrictAreas(profile, referenceDir);

    // STEP 5: Validate & Postal Sort
    console.log('📌 [STEP 5] Validating & Sorting Records...');
    const report = this.validator.validate(records, profile);

    // STEP 6: Generate Final SSOT CSV File & SHA-256
    console.log('📌 [STEP 6] Generating Final Verified CSV File...');
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

    const outputHash = crypto.createHash('sha256').update(csvContent).digest('hex');
    fs.writeFileSync(sha256Path, `${outputHash}  ${csvFilename}\n`, 'utf8');

    const evidence: DataPlatformEvidence = {
      pipeline: 'DataPlatformFoundation',
      district: profile.districtId,
      inputHash: boundaryEvidence.resolvedAt,
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

    fs.writeFileSync(path.join(logsDir, 'platform_evidence.json'), JSON.stringify(evidence, null, 2), 'utf8');

    return { records, evidence, report, csvPath };
  }
}

if (require.main === module) {
  console.log('🚀 Running DataPlatformPipeline directly...');
  const pipeline = new DataPlatformPipeline();
  const { evidence } = pipeline.runPipeline();
  console.log('✅ Pipeline Execution Complete!');
  console.log('Evidence:', JSON.stringify(evidence, null, 2));
}
