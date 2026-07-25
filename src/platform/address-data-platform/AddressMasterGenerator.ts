import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { NationalAddressMasterRecord } from './AddressHierarchyParser';

export interface AddressMasterManifest {
  totalRecords: number;
  outputCsvPath: string;
  sha256: string;
  generatedAt: string;
  status: 'NATIONAL_ADDRESS_MASTER_READY';
}

export class AddressMasterGenerator {
  public static generateMasterCsv(
    records: NationalAddressMasterRecord[],
    outputDir: string
  ): AddressMasterManifest {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const csvFilename = 'NATIONAL_ADDRESS_MASTER.csv';
    const csvPath = path.join(outputDir, csvFilename);
    const sha256Path = path.join(outputDir, `${csvFilename}.sha256`);

    const header = 'prefecture,municipality,level1,level2,postal_code,municipality_code,is_complete';
    const lines = [header];

    records.forEach(r => {
      lines.push(`${r.prefecture},${r.municipality},${r.level1},${r.level2},${r.postalCode},${r.municipalityCode},${r.isComplete}`);
    });

    const csvContent = lines.join('\n');
    fs.writeFileSync(csvPath, csvContent, 'utf8');

    const sha256 = crypto.createHash('sha256').update(csvContent).digest('hex');
    fs.writeFileSync(sha256Path, `${sha256}  ${csvFilename}\n`, 'utf8');

    const manifest: AddressMasterManifest = {
      totalRecords: records.length,
      outputCsvPath: csvPath,
      sha256,
      generatedAt: new Date().toISOString(),
      status: 'NATIONAL_ADDRESS_MASTER_READY'
    };

    fs.writeFileSync(path.join(outputDir, 'master_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

    return manifest;
  }
}
