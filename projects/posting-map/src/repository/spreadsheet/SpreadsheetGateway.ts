export interface SpreadsheetGateway {
  /**
   * Resolves whether the sheet exists.
   */
  hasSheet(sheetName: string): Promise<boolean>;

  /**
   * Finds a row index by a specific key.
   */
  findRowIndex(sheetName: string, keyColumnIndex: number, key: string): Promise<number | null>;

  /**
   * Reads a specific row.
   */
  readRow(sheetName: string, rowIndex: number): Promise<any[] | null>;

  /**
   * Updates an existing row.
   */
  updateRow(sheetName: string, rowIndex: number, rowData: any[]): Promise<void>;

  /**
   * Appends a new row to the sheet.
   */
  appendRow(sheetName: string, rowData: any[]): Promise<void>;

  /**
   * Flushes all pending changes to the spreadsheet.
   */
  flush(): Promise<void>;
}
