import { GasConfigurationProvider } from './GasConfigurationProvider';

export class SpreadsheetBatchReader {
  private configProvider: GasConfigurationProvider;
  private cachedSpreadsheet: any = null;

  constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
  }

  private getSpreadsheet(): any {
    if (this.cachedSpreadsheet) return this.cachedSpreadsheet;
    
    if (typeof SpreadsheetApp !== 'undefined') {
      const ssId = this.configProvider.getSpreadsheetId();
      this.cachedSpreadsheet = SpreadsheetApp.openById(ssId);
      return this.cachedSpreadsheet;
    }
    return null;
  }

  /**
   * 指定シートの全データを1回の getValues() で一括読み出しする
   */
  public readAll(sheetName: string): any[][] {
    const ss = this.getSpreadsheet();
    if (!ss) return [];

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];

      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow === 0 || lastCol === 0) return [];

      return sheet.getRange(1, 1, lastRow, lastCol).getValues();
    } catch (e) {
      console.error(`[SpreadsheetBatchReader] Error reading sheet ${sheetName}:`, e);
      return [];
    }
  }

  /**
   * 特定のレンジのみを一括取得する
   */
  public readRange(sheetName: string, startRow: number, startCol: number, numRows: number, numCols: number): any[][] {
    const ss = this.getSpreadsheet();
    if (!ss) return [];

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];

      return sheet.getRange(startRow, startCol, numRows, numCols).getValues();
    } catch (e) {
      console.error(`[SpreadsheetBatchReader] Error reading range from ${sheetName}:`, e);
      return [];
    }
  }
}

// Global declaration for GAS type safety during compiler checks
declare const SpreadsheetApp: any;
