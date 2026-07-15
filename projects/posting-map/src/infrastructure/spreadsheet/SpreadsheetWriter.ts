import { SpreadsheetClient } from './SpreadsheetClient';
import { RepositoryPerformanceProfiler } from '../repository/profiler/RepositoryPerformanceProfiler';

export class SpreadsheetWriter {
  private client: SpreadsheetClient;

  constructor() {
    this.client = SpreadsheetClient.getInstance();
  }

  public appendRows(sheetName: string, rows: any[][]): void {
    const ss = this.client.getSpreadsheet();
    if (!ss) return;

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;

      RepositoryPerformanceProfiler.getInstance().incrementWrite(sheetName);

      const lastRow = sheet.getLastRow();
      
      const targetRow = lastRow === 0 ? 1 : lastRow + 1;
      const targetCol = 1;
      
      if (rows.length === 0) return;
      sheet.getRange(targetRow, targetCol, rows.length, rows[0].length).setValues(rows);
    } catch (e) {
      console.error(`[SpreadsheetWriter] Error appending rows to ${sheetName}:`, e);
    }
  }

  public updateRange(sheetName: string, startRow: number, startCol: number, values: any[][]): void {
    const ss = this.client.getSpreadsheet();
    if (!ss) return;

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;

      RepositoryPerformanceProfiler.getInstance().incrementWrite(sheetName);

      if (values.length === 0) return;
      sheet.getRange(startRow, startCol, values.length, values[0].length).setValues(values);
    } catch (e) {
      console.error(`[SpreadsheetWriter] Error updating range in ${sheetName}:`, e);
    }
  }

  public deleteRow(sheetName: string, rowIndex: number): void {
    const ss = this.client.getSpreadsheet();
    if (!ss) return;

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;

      RepositoryPerformanceProfiler.getInstance().incrementWrite(sheetName);

      sheet.deleteRow(rowIndex);
    } catch (e) {
      console.error(`[SpreadsheetWriter] Error deleting row in ${sheetName}:`, e);
    }
  }
}
