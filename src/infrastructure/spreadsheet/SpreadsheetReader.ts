import { SpreadsheetClient } from './SpreadsheetClient';
import { RepositoryPerformanceProfiler } from '../repository/profiler/RepositoryPerformanceProfiler';

export class SpreadsheetReader {
  private client: SpreadsheetClient;

  constructor() {
    this.client = SpreadsheetClient.getInstance();
  }

  public readAll(sheetName: string): any[][] {
    const ss = this.client.getSpreadsheet();
    if (!ss) return [];

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];

      RepositoryPerformanceProfiler.getInstance().incrementRead(sheetName);

      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow === 0 || lastCol === 0) return [];

      return sheet.getRange(1, 1, lastRow, lastCol).getValues();
    } catch (e) {
      console.error(`[SpreadsheetReader] Error reading sheet ${sheetName}:`, e);
      return [];
    }
  }

  public readRange(sheetName: string, startRow: number, startCol: number, numRows: number, numCols: number): any[][] {
    const ss = this.client.getSpreadsheet();
    if (!ss) return [];

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];

      RepositoryPerformanceProfiler.getInstance().incrementRead(sheetName);

      return sheet.getRange(startRow, startCol, numRows, numCols).getValues();
    } catch (e) {
      console.error(`[SpreadsheetReader] Error reading range from ${sheetName}:`, e);
      return [];
    }
  }
}
