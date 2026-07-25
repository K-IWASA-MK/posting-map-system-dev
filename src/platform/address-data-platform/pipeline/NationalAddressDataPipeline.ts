import * as fs from 'fs';
import * as path from 'path';
import { RawDataIngestor, RawAuditManifest } from '../raw/RawDataIngestor';
import { NationalAddressHierarchyParser, AddressMasterRecord } from '../parser/NationalAddressHierarchyParser';
import { AddressMasterGenerator, AddressMasterEvidence } from '../generator/AddressMasterGenerator';

export interface NationalPipelineResult {
  rawAuditManifest: RawAuditManifest;
  masterEvidence: AddressMasterEvidence;
  records: AddressMasterRecord[];
}

export class NationalAddressDataPipeline {
  public runPipeline(dataDir: string = path.join(__dirname, '../../../../data')): NationalPipelineResult {
    console.log("==================================================");
    console.log("🌏 RUNNING NATIONAL ADDRESS DATA PIPELINE (STEP 1 - STEP 4)");
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

    const records: AddressMasterRecord[] = lines.map(l => {
      const parts = l.split(',').map(p => p.replace(/"/g, '').trim());
      const postalCode = parts[1] || '5100000';
      const prefecture = parts[2] || '三重県';
      const municipality = parts[3] || '桑名市';
      const rawAddr = parts[4] || '';

      return NationalAddressHierarchyParser.parseAddressRow(prefecture, municipality, rawAddr, postalCode);
    });

    console.log(`✅ Parsed ${records.length} Address Master Records!`);

    // STEP 4: ADDRESS_MASTER.csv Generation
    console.log("📌 [STEP 4] Generating ADDRESS_MASTER.csv & Evidence...");
    const masterEvidence = AddressMasterGenerator.generateMasterCsv(records, masterDir);
    console.log(`✅ ADDRESS_MASTER.csv Complete! Output: ${masterEvidence.outputCsvPath}`);

    return {
      rawAuditManifest,
      masterEvidence,
      records
    };
  }
}

if (require.main === module) {
  const pipeline = new NationalAddressDataPipeline();
  pipeline.runPipeline();
}
