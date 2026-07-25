import * as fs from 'fs';
import * as path from 'path';
import { PostalCsvIngestor, RawPostalFileMetadata } from './PostalCsvIngestor';
import { AddressHierarchyParser, NationalAddressMasterRecord } from './AddressHierarchyParser';
import { AddressMasterGenerator, AddressMasterManifest } from './AddressMasterGenerator';

export interface NationalAddressPipelineResult {
  ingestMetadata: RawPostalFileMetadata;
  masterManifest: AddressMasterManifest;
  records: NationalAddressMasterRecord[];
}

export class NationalAddressPipeline {
  public runPipeline(dataDir: string = path.join(__dirname, '../../../../data')): NationalAddressPipelineResult {
    console.log("==================================================");
    console.log("🌏 RUNNING NATIONAL ADDRESS DATA PLATFORM PIPELINE");
    console.log("==================================================\n");

    const rawPostalDir = path.join(dataDir, 'raw/postal');
    const masterDir = path.join(dataDir, 'master');

    // STEP 0-1: Ingest Japan Post Raw CSV & Generate raw_hash.json
    console.log("📌 [STEP 0-1] Ingesting Japan Post CSV & Calculating SHA-256...");
    const sourcePostalCsv = path.join(__dirname, '../../../../FIELD_OPERATIONS_PLATFORM/01_MASTER/MIE_POSTAL.CSV');
    const ingestMetadata = PostalCsvIngestor.ingestPostalCsv(sourcePostalCsv, rawPostalDir);
    console.log(`✅ Ingest Complete! Loaded ${ingestMetadata.recordCount} records (SHA-256: ${ingestMetadata.sha256.substring(0, 16)}...)`);

    // STEP 0-2: National Address Hierarchy Parsing (Rule v3 Engine)
    console.log("📌 [STEP 0-2] Executing Rule v3 Address Hierarchy Parsing...");
    const rawCsvPath = path.join(rawPostalDir, 'utf_ken_all.csv');
    const lines = fs.readFileSync(rawCsvPath, 'utf8').split('\n').filter(Boolean);

    const records: NationalAddressMasterRecord[] = lines.map(l => {
      const parts = l.split(',').map(p => p.replace(/"/g, '').trim());
      const munCode = parts[0] || '24200';
      const postalCode = parts[1] || '5100000';
      const prefecture = parts[2] || '三重県';
      const city = parts[3] || '桑名市';
      const rawAddr = parts[4] || '';

      return AddressHierarchyParser.parseAddressRow(munCode, postalCode, prefecture, city, rawAddr);
    });

    console.log(`✅ Parsed ${records.length} National Address Master Records!`);

    // STEP 0-3: Generate NATIONAL_ADDRESS_MASTER.csv & SHA-256
    console.log("📌 [STEP 0-3] Generating NATIONAL_ADDRESS_MASTER.csv & Manifest...");
    const masterManifest = AddressMasterGenerator.generateMasterCsv(records, masterDir);
    console.log(`✅ National Address Master Ready! Output: ${masterManifest.outputCsvPath}`);

    return {
      ingestMetadata,
      masterManifest,
      records
    };
  }
}

if (require.main === module) {
  const pipeline = new NationalAddressPipeline();
  pipeline.runPipeline();
}
