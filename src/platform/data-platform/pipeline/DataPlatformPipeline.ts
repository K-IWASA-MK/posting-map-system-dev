import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AreaRecord, DistrictValidationProfile, DataPlatformEvidence, MIE03_VALIDATION_PROFILE } from '../schema/AreaSchema';
import { RawDataPreserver } from '../integrity/RawDataPreserver';
import { DistrictExtractor } from '../extractor/DistrictExtractor';
import { DataValidator, ValidationReport } from '../validator/DataValidator';
import { DistrictBoundaryResolver } from '../resolver/DistrictBoundaryResolver';
import { AddressHierarchyExtractor, AddressSeedNode } from '../extractor/AddressHierarchyExtractor';
import { BoundaryConfirmationGate } from '../gate/BoundaryConfirmationGate';
import { BoundaryEvidenceGate } from '../gate/BoundaryEvidenceGate';
import { FinalCsvGenerator } from '../final-csv/FinalCsvGenerator';

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

    // STEP 0: Municipality Split Risk Analysis & Boundary Confirmation Gate (GATE 0)
    console.log('📌 [STEP 0] Running Municipality Split Risk Analysis & Boundary Confirmation Gate...');
    const rawMunicipalities = ['四日市市（一部）', '桑名市', 'いなべ市', '木曽岬町', '東員町', '菰野町', '朝日町', '川越町'];
    const boundaryManifest = BoundaryConfirmationGate.analyzeAndValidate(profile.districtId, rawMunicipalities);

    if (boundaryManifest.gateStatus !== 'PASS') {
      throw new Error(`[BoundaryConfirmationGate] GATE REJECTED. Municipality split analysis failed for ${profile.districtId}`);
    }

    fs.writeFileSync(path.join(logsDir, 'boundary_confirmation_manifest.json'), JSON.stringify(boundaryManifest, null, 2), 'utf8');
    console.log(`✅ [BoundaryConfirmationGate] PASS! Pattern A Whole: ${boundaryManifest.wholeMunicipalities.length}, Pattern B Split: ${boundaryManifest.splitMunicipalities.length}`);

    // STEP 1: District Boundary Resolution
    console.log('📌 [STEP 1] Running District Boundary Resolver...');
    const boundaryEvidence = this.boundaryResolver.resolveDistrictBoundary(profile.districtId, referenceDir);
    fs.writeFileSync(path.join(logsDir, 'boundary_evidence.json'), JSON.stringify(boundaryEvidence, null, 2), 'utf8');

    // STEP 1.5: Boundary Evidence Gate
    console.log('📌 [STEP 1.5] Running Boundary Evidence Gate...');
    const boundaryGateResult = BoundaryEvidenceGate.verifyAndGenerateProof(boundaryEvidence);
    fs.writeFileSync(path.join(logsDir, 'boundary_evidence_gate.json'), JSON.stringify(boundaryGateResult, null, 2), 'utf8');

    if (boundaryGateResult.gateStatus !== 'PASS') {
      throw new Error(`[BoundaryEvidenceGate] GATE REJECTED. Boundary proof verification failed for ${profile.districtId}`);
    }
    console.log('✅ [BoundaryEvidenceGate] PASS! Yokkaichi boundary proof verified (included vs excluded subdistricts certified)');

    // STEP 2: Address Extraction Rule v3 (Dynamic Completeness Decision Engine)
    console.log('📌 [STEP 2] Running Address Hierarchy Extractor (Address Extraction Rule v3)...');
    const rawSeeds: AddressSeedNode[] = [
      { city: '桑名市', level1: '江場', level2: '1丁目' },
      { city: '東員町', level1: '1丁目' },
      { city: '四日市市（一部）', level1: '富田1丁目' }
    ];
    const hierarchyNodes = this.hierarchyExtractor.extractHierarchy(boundaryEvidence, rawSeeds);

    // STEP 3: FINAL CSV Generator (SSOT Creation & Postal Ascending Sort)
    console.log('📌 [STEP 3] Running FINAL CSV Generator (SSOT Output & Postal Code Ascending Sort)...');
    const rawRecords: AreaRecord[] = this.extractor.extractDistrictAreas(profile, referenceDir);
    const report = this.validator.validate(rawRecords, profile);

    const finalCsvRes = FinalCsvGenerator.generateFinalCsv(profile.districtId, rawRecords, outputDir, logsDir);

    const evidence: DataPlatformEvidence = {
      pipeline: 'DataPlatformFoundation',
      district: profile.districtId,
      inputHash: boundaryEvidence.resolvedAt,
      outputHash: finalCsvRes.outputHash,
      recordCount: finalCsvRes.recordCount,
      validation: report.passed ? 'PASS' : 'FAIL',
      generatedBy,
      timestamp: new Date().toISOString(),
      details: {
        expectedCount: profile.expectedCount,
        matchedCount: finalCsvRes.recordCount,
        duplicatedCount: report.duplicateCount,
        profileVersion: profile.version
      }
    };

    fs.writeFileSync(path.join(logsDir, 'platform_evidence.json'), JSON.stringify(evidence, null, 2), 'utf8');

    return { records: rawRecords, evidence, report, csvPath: finalCsvRes.csvPath };
  }
}

if (require.main === module) {
  console.log('🚀 Running DataPlatformPipeline directly...');
  const pipeline = new DataPlatformPipeline();
  const { evidence } = pipeline.runPipeline();
  console.log('✅ Pipeline Execution Complete!');
  console.log('Evidence:', JSON.stringify(evidence, null, 2));
}
