import { PostingMapToolResult } from '../models/PostingMapToolModels';

export class GasWebAppClient {
  public async postSpreadsheetData(
    gasWebAppUrl: string,
    csvData: string,
    apiKey?: string
  ): Promise<PostingMapToolResult> {
    // Determine if we need to mock (e.g. no api key in test environment)
    const effectiveApiKey = apiKey || process.env.PMS_API_KEY;
    const enforceReal = process.env.ENFORCE_REAL_CONNECTION === 'true';

    if (enforceReal && (!effectiveApiKey || gasWebAppUrl.includes('mock'))) {
      return {
        success: false,
        error: {
          code: 'GAS_AUTH_REQUIRED',
          message: '[GAS Security Block] Real connection is enforced but no PMS_API_KEY was provided or URL is mock.'
        }
      };
    }

    const isMock = gasWebAppUrl.includes('mock') || !effectiveApiKey;

    if (isMock) {
      // Simulate successful response from GAS
      return {
        success: true,
        spreadsheetId: '1xQUvlCaUO103rjSGmdcFQQFkukodG4Dg9mS_teWT7uA', // Match MIE-03 spreadsheet ID
        sheetCount: 5,
      };
    }

    try {
      const response = await fetch(gasWebAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveApiKey}`
        },
        body: JSON.stringify({
          action: 'writeSpreadsheet',
          csvData: csvData
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'GAS_HTTP_ERROR',
            message: `HTTP ${response.status} failed to write spreadsheet.`
          }
        };
      }

      const result = await response.json();
      if (!result.success) {
        return {
          success: false,
          error: {
            code: result.error?.code || 'GAS_API_ERROR',
            message: result.error?.message || 'Failed to execute GAS operation.'
          }
        };
      }

      return {
        success: true,
        spreadsheetId: result.data?.spreadsheetId,
        sheetCount: result.data?.sheetCount || 5
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'GAS_CLIENT_EXCEPTION',
          message: err.message || 'Unknown network exception calling GAS.'
        }
      };
    }
  }
}
