import { SpreadsheetGateway } from './SpreadsheetGateway';

export class MockSpreadsheetGateway implements SpreadsheetGateway {
  private sheets: Map<string, any[][]> = new Map();

  public async hasSheet(sheetName: string): Promise<boolean> {
    return this.sheets.has(sheetName);
  }

  public async findRowIndex(sheetName: string, keyColumnIndex: number, key: string): Promise<number | null> {
    const sheet = this.sheets.get(sheetName);
    if (!sheet) return null;

    const index = sheet.findIndex(row => row[keyColumnIndex] === key);
    return index !== -1 ? index : null;
  }

  public async readRow(sheetName: string, rowIndex: number): Promise<any[] | null> {
    const sheet = this.sheets.get(sheetName);
    if (!sheet || rowIndex < 0 || rowIndex >= sheet.length) return null;
    return [...sheet[rowIndex]]; // return a copy
  }

  public async updateRow(sheetName: string, rowIndex: number, rowData: any[]): Promise<void> {
    const sheet = this.sheets.get(sheetName);
    if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
    if (rowIndex < 0 || rowIndex >= sheet.length) throw new Error(`Row index ${rowIndex} out of bounds`);
    
    sheet[rowIndex] = [...rowData];
  }

  public async appendRow(sheetName: string, rowData: any[]): Promise<void> {
    if (!this.sheets.has(sheetName)) {
      this.sheets.set(sheetName, []);
    }
    const sheet = this.sheets.get(sheetName)!;
    sheet.push([...rowData]);
  }

  public async flush(): Promise<void> {
    // In mock, changes are already reflected in the map.
    return Promise.resolve();
  }

  // --- Test utility methods ---
  public _seedSheet(sheetName: string, data: any[][]) {
    this.sheets.set(sheetName, data);
  }
  
  public _getSheet(sheetName: string): any[][] | undefined {
    return this.sheets.get(sheetName);
  }
}
