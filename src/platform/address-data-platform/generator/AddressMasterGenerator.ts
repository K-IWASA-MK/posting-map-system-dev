import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AddressMasterRecord } from '../parser/NationalAddressHierarchyParser';

export interface AddressMasterEvidence {
  totalAddressRecords: number;
  outputCsvPath: string;
  sha256: string;
  generatedAt: string;
  status: 'ADDRESS_MASTER_COMPLETED';
}

export class AddressMasterGenerator {
  public static generateMasterCsv(
    records: AddressMasterRecord[],
    masterDir: string
  ): AddressMasterEvidence {
    if (!fs.existsSync(masterDir)) fs.mkdirSync(masterDir, { recursive: true });

    const csvFilename = 'ADDRESS_MASTER.csv';
    const csvPath = path.join(masterDir, csvFilename);
    const sha256Path = path.join(masterDir, `${csvFilename}.sha256`);

    const header = 'prefecture,municipality,address_level_1,address_level_2,postal_code,source,hash';
    const lines = [header];

    records.forEach(r => {
      lines.push(`${r.prefecture},${r.municipality},${r.addressLevel1},${r.addressLevel2},${r.postalCode},${r.source},${r.hash}`);
    });

    const csvContent = lines.join('\n');
    fs.writeFileSync(csvPath, csvContent, 'utf8');

    const sha256 = crypto.createHash('sha256').update(csvContent).digest('hex');
    fs.writeFileSync(sha256Path, `${sha256}  ${csvFilename}\n`, 'utf8');

    const evidence: AddressMasterEvidence = {
      totalAddressRecords: records.length,
      outputCsvPath: csvPath,
      sha256,
      generatedAt: new Date().toISOString(),
      status: 'ADDRESS_MASTER_COMPLETED'
    };

    fs.writeFileSync(path.join(masterDir, 'address_master_evidence.json'), JSON.stringify(evidence, null, 2), 'utf8');

    return evidence;
  }
}
