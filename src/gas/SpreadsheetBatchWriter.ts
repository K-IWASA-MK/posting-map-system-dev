import { GasConfigurationProvider } from './GasConfigurationProvider';

export class SpreadsheetBatchWriter {
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
   * 複数行のデータを末尾へ一括追記する
   */
  public appendRows(sheetName: string, rows: any[][]): void {
    if (rows.length === 0) return;

    const ss = this.getSpreadsheet();
    if (!ss) return;

    try {
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      }

      const lastRow = sheet.getLastRow();
      const numCols = rows[0].length;
      
      sheet.getRange(lastRow + 1, 1, rows.length, numCols).setValues(rows);
    } catch (e) {
      console.error(`[SpreadsheetBatchWriter] Error appending to sheet ${sheetName}:`, e);
      throw e;
    }
  }

  /**
   * 特定の範囲を一括更新（上書き）する
   */
  public updateRange(sheetName: string, startRow: number, startCol: number, rows: any[][]): void {
    if (rows.length === 0) return;

    const ss = this.getSpreadsheet();
    if (!ss) return;

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        throw new Error(`Sheet ${sheetName} not found for updateRange.`);
      }

      sheet.getRange(startRow, startCol, rows.length, rows[0].length).setValues(rows);
    } catch (e) {
      console.error(`[SpreadsheetBatchWriter] Error updating range in sheet ${sheetName}:`, e);
      throw e;
    }
  }
}

// Global declaration for GAS type safety during compiler checks
declare const SpreadsheetApp: any;
