import * as crypto from 'crypto';
import { SpreadsheetEvidence } from '../models/PostingMapToolModels';

export class SpreadsheetEvidenceBuilder {
  public buildEvidence(
    spreadsheetId: string,
    csvData: string,
    sheetCount: number
  ): SpreadsheetEvidence {
    const lines = csvData.trim().split('\n').filter(line => line.trim().length > 0);
    const rowCount = lines.length > 0 ? lines.length - 1 : 0; // Exclude header

    // SHA-256 Hash of the CSV data
    const hash = crypto.createHash('sha256').update(csvData.trim()).digest('hex');

    return {
      spreadsheetId,
      sheetCount,
      rowCount,
      hash,
      timestamp: new Date().toISOString()
    };
  }
}
