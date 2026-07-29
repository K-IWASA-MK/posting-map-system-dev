import * as fs from 'fs';
import * as path from 'path';
import { RawDataIngestor, RawAuditManifest } from '../raw/RawDataIngestor';
import { NationalAddressHierarchyParser, AddressMasterRecord } from '../parser/NationalAddressHierarchyParser';
import { AddressMasterGenerator, AddressMasterEvidence } from '../generator/AddressMasterGenerator';
import { AddressMasterVerifier, AddressMasterAccuracyReport } from '../verifier/AddressMasterVerifier';
import { AddressMasterReleaseGate, AddressMasterReleaseManifest } from '../gate/AddressMasterReleaseGate';
import { BoundaryMasterFoundation, DistrictBoundaryDefinition, BoundaryMasterManifest, BoundAreaRecord } from '../boundary/BoundaryMasterFoundation';
import { BoundaryMasterVerifier, BoundaryAccuracyReport } from '../verifier/BoundaryMasterVerifier';
import { AreaGenerator, AreaGenerationManifest, FinalAreaRecord } from '../area/AreaGenerator';
import { AreaAccuracyVerifier, AreaAccuracyReport } from '../area/AreaAccuracyVerifier';

export interface NationalPipelineResult {
  rawAuditManifest: RawAuditManifest;
  masterEvidence: AddressMasterEvidence;
  verificationReport: AddressMasterAccuracyReport;
  releaseManifest: AddressMasterReleaseManifest;
  boundaryManifest?: BoundaryMasterManifest;
  boundaryAccuracyReport?: BoundaryAccuracyReport;
  areaManifest?: AreaGenerationManifest;
  areaAccuracyReport?: AreaAccuracyReport;
  boundRecords?: BoundAreaRecord[];
  finalRecords?: FinalAreaRecord[];
  records: AddressMasterRecord[];
}

export class NationalAddressDataPipeline {
  public runPipeline(
    dataDir: string = path.join(__dirname, '../../../../data'),
    targetBoundaryDef?: DistrictBoundaryDefinition
  ): NationalPipelineResult {
    console.log("==================================================");
    console.log("🌏 RUNNING NATIONAL ADDRESS DATA PIPELINE (STEP 1 - STEP 9)");
    console.log("==================================================\n");

    const rawDir = path.join(dataDir, 'raw');
    const masterDir = path.join(dataDir, 'master');

    // STEP 1 & STEP 2: Ingest & Raw Data Audit
    console.log("📌 [STEP 1 & STEP 2] Ingesting Raw Data & Generating raw_audit_manifest.json...");
    const rawAuditManifest = RawDataIngestor.ingestAndAudit(dataDir);
    console.log(`✅ Raw Data Audited! Postal Hash: ${rawAuditManifest.postal.sha256.substring(0, 16)}..., Admin Hash: ${rawAuditManifest.administrative.sha256.substring(0, 16)}...`);

    // STEP 3: National Address Hierarchy Parsing (Rule v3)
    console.log("📌 [STEP 3] Executing Rule v3 Address Hierarchy Parsing (ADDRESS_MASTER)...");
    const rawPostalPath = path.join(rawDir, 'postal/KEN_ALL.CSV');
    const postalContent = fs.readFileSync(rawPostalPath, 'utf8');
    const lines = postalContent.split('\n').filter(Boolean);

    const rawRecords: AddressMasterRecord[] = lines.map(l => {
      const parts = l.split(',').map(p => p.replace(/"/g, '').trim());
      // KEN_ALL format: [0]code, [1]zip5, [2]zip7, [3]pref_kana, [4]city_kana, [5]town_kana, [6]pref, [7]city, [8]town
      const postalCode = parts[2] && parts[2].length === 7 ? parts[2] : (parts[1] || '5100000');
      const prefecture = parts[6] || parts[2] || '三重県';
      const municipality = parts[7] || parts[3] || '桑名市';
      const rawAddr = parts[8] || parts[4] || '';

      return NationalAddressHierarchyParser.parseAddressRow(prefecture, municipality, rawAddr, postalCode);
    });

    console.log(`✅ Parsed ${rawRecords.length} Address Master Records!`);

    // STEP 4: ADDRESS_MASTER.csv Generation
    console.log("📌 [STEP 4] Generating ADDRESS_MASTER.csv & Evidence...");
    const masterEvidence = AddressMasterGenerator.generateMasterCsv(rawRecords, masterDir);
    console.log(`✅ ADDRESS_MASTER.csv Complete! Output: ${masterEvidence.outputCsvPath}`);

    // STEP 5: National Address Master Accuracy Verification Engine
    console.log("📌 [STEP 5] Executing Address Master Accuracy Verification Engine...");
    const { normalizedRecords, report: verificationReport } = AddressMasterVerifier.verifyAddressMaster(
      rawAuditManifest,
      masterEvidence,
      rawRecords,
      masterDir
    );

    if (verificationReport.verificationStatus !== 'ADDRESS_MASTER_VERIFICATION_PASS') {
      throw new Error(`[AddressMasterVerifier] VERIFICATION FAILED! Missing level 1 count: ${verificationReport.missingLevel1Count}`);
    }

    // STEP 6: Address Master Release Gate (GENERATED -> VALIDATED -> ACCURACY_CHECKED -> AUDITED -> RELEASED)
    console.log("📌 [STEP 6] Executing Address Master Release Gate...");
    const releaseManifest = AddressMasterReleaseGate.evaluateAndRelease(
      verificationReport,
      masterEvidence.outputCsvPath,
      masterDir
    );

    if (releaseManifest.gateStatus !== 'ADDRESS_MASTER_RELEASE_PASS') {
      throw new Error(`[AddressMasterReleaseGate] GATE REJECTED. National Address Master release failed.`);
    }

    // STEP 7 & STEP 8: Boundary Master Foundation & Verification
    let boundaryManifest: BoundaryMasterManifest | undefined;
    let boundaryAccuracyReport: BoundaryAccuracyReport | undefined;
    let areaManifest: AreaGenerationManifest | undefined;
    let areaAccuracyReport: AreaAccuracyReport | undefined;
    let boundRecords: BoundAreaRecord[] | undefined;
    let finalRecords: FinalAreaRecord[] | undefined;

    if (targetBoundaryDef) {
      console.log(`📌 [STEP 7] Running Boundary Master Foundation for ${targetBoundaryDef.districtId}...`);
      const boundaryRes = BoundaryMasterFoundation.overlayBoundaryMaster(
        releaseManifest,
        normalizedRecords,
        targetBoundaryDef,
        path.join(dataDir, 'boundary')
      );
      boundaryManifest = boundaryRes.manifest;
      boundRecords = boundaryRes.boundRecords;

      console.log(`📌 [STEP 8] Running Boundary Master Accuracy Verification Engine for ${targetBoundaryDef.districtId}...`);
      boundaryAccuracyReport = BoundaryMasterVerifier.verifyBoundaryMaster(
        boundaryManifest,
        boundRecords,
        normalizedRecords,
        targetBoundaryDef,
        path.join(dataDir, 'boundary')
      );

      if (boundaryAccuracyReport.verificationStatus !== 'BOUNDARY_ACCURACY_VERIFICATION_PASS') {
        throw new Error(`[BoundaryMasterVerifier] VERIFICATION FAILED for ${targetBoundaryDef.districtId}`);
      }

      // STEP 9: POSTING MAP Area Generation & Verification Engine
      console.log(`📌 [STEP 9] Running Area Generation Engine for ${targetBoundaryDef.districtId}...`);
      const areaRes = AreaGenerator.generateFinalAreas(
        boundaryManifest,
        boundaryAccuracyReport,
        boundRecords,
        path.join(dataDir, 'output')
      );
      areaManifest = areaRes.manifest;
      finalRecords = areaRes.finalRecords;

      areaAccuracyReport = AreaAccuracyVerifier.verifyFinalAreas(
        areaManifest,
        finalRecords,
        path.join(dataDir, 'output')
      );

      if (areaAccuracyReport.verificationStatus !== 'AREA_ACCURACY_VERIFICATION_PASS') {
        throw new Error(`[AreaAccuracyVerifier] VERIFICATION FAILED for ${targetBoundaryDef.districtId}`);
      }
    }

    return {
      rawAuditManifest,
      masterEvidence,
      verificationReport,
      releaseManifest,
      boundaryManifest,
      boundaryAccuracyReport,
      areaManifest,
      areaAccuracyReport,
      boundRecords,
      finalRecords,
      records: normalizedRecords
    };
  }
}

if (require.main === module) {
  const pipeline = new NationalAddressDataPipeline();
  pipeline.runPipeline();
}
