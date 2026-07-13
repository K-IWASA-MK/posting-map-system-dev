import { GasConfigurationProvider } from '../gas/GasConfigurationProvider';

export class SpreadsheetClient {
  private static instance: SpreadsheetClient | null = null;
  private cachedSpreadsheet: any = null;
  private configProvider: GasConfigurationProvider;

  private constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
  }

  public static getInstance(): SpreadsheetClient {
    if (!SpreadsheetClient.instance) {
      SpreadsheetClient.instance = new SpreadsheetClient();
    }
    return SpreadsheetClient.instance;
  }

  /**
   * For testing, allows injecting a mocked instance or setting cached spreadsheet.
   */
  public static setMockInstance(mock: SpreadsheetClient): void {
    SpreadsheetClient.instance = mock;
  }

  public getSpreadsheet(): any {
    if (this.cachedSpreadsheet) return this.cachedSpreadsheet;
    
    if (typeof SpreadsheetApp !== 'undefined') {
      const ssId = this.configProvider.getSpreadsheetId();
      this.cachedSpreadsheet = SpreadsheetApp.openById(ssId);
      return this.cachedSpreadsheet;
    }
    return null;
  }

  public setSpreadsheet(ss: any): void {
    this.cachedSpreadsheet = ss;
  }
}

declare const SpreadsheetApp: any;
