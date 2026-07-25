/**
 * POSTING MAP Tool Adapter Models
 */

export interface SpreadsheetEvidence {
  readonly spreadsheetId: string;
  readonly sheetCount: number;
  readonly rowCount: number;
  readonly hash: string;
  readonly timestamp: string;
}

export interface PostingMapToolInput {
  readonly csvData: string;
  readonly expectedRowCount: number;
  readonly gasWebAppUrl: string;
  readonly apiKey?: string;
}

export interface PostingMapToolResult {
  readonly success: boolean;
  readonly spreadsheetId?: string;
  readonly sheetCount?: number;
  readonly error?: {
    code: string;
    message: string;
  };
}
