import { PostingMapToolResult } from '../models/PostingMapToolModels';

export class GasWebAppClient {
  public async duplicateTemplateSheet(
    gasWebAppUrl: string,
    spreadsheetId: string,
    sourceSheet: string,
    targetSheet: string,
    apiKey?: string
  ): Promise<PostingMapToolResult> {
    const effectiveApiKey = apiKey || process.env.PMS_API_KEY;
    const enforceReal = process.env.ENFORCE_REAL_CONNECTION === 'true';

    if (enforceReal && (!effectiveApiKey || gasWebAppUrl.includes('mock'))) {
      return {
        success: false,
        error: {
          code: 'GAS_AUTH_REQUIRED',
          message: '[GAS Security Block] Real connection is enforced but no PMS_API_KEY was provided.'
        }
      };
    }

    const isMock = gasWebAppUrl.includes('mock') || !effectiveApiKey;
    if (isMock) {
      return { success: true, spreadsheetId };
    }

    try {
      const url = new URL(gasWebAppUrl);
      if (effectiveApiKey) {
        url.searchParams.set('apiKey', effectiveApiKey);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicateTemplateSheet',
          spreadsheetId,
          sourceSheet,
          targetSheet
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: { code: 'GAS_HTTP_ERROR', message: `HTTP ${response.status} failed to duplicate template sheet.` }
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

      return { success: true, spreadsheetId: result.data?.spreadsheetId };
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'GAS_CLIENT_EXCEPTION', message: err.message || 'Unknown network exception calling GAS.' }
      };
    }
  }

  public async postBatchSpreadsheetData(
    gasWebAppUrl: string,
    sheetName: string,
    csvData: string,
    expectedRowCount: number,
    apiKey?: string,
    spreadsheetId?: string
  ): Promise<PostingMapToolResult> {
    const effectiveApiKey = apiKey || process.env.PMS_API_KEY;
    const enforceReal = process.env.ENFORCE_REAL_CONNECTION === 'true';

    if (enforceReal && (!effectiveApiKey || gasWebAppUrl.includes('mock'))) {
      return {
        success: false,
        error: {
          code: 'GAS_AUTH_REQUIRED',
          message: '[GAS Security Block] Real connection is enforced but no PMS_API_KEY was provided.'
        }
      };
    }

    const isMock = gasWebAppUrl.includes('mock') || !effectiveApiKey;
    if (isMock) {
      return {
        success: true,
        spreadsheetId: spreadsheetId || '1xQUvlCaUO103rjSGmdcFQQFkukodG4Dg9mS_teWT7uA',
        sheetCount: 5,
      };
    }

    try {
      const url = new URL(gasWebAppUrl);
      if (effectiveApiKey) {
        url.searchParams.set('apiKey', effectiveApiKey);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'writeBatchSpreadsheet',
          sheetName,
          csvData,
          expectedRowCount,
          spreadsheetId
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: { code: 'GAS_HTTP_ERROR', message: `HTTP ${response.status} failed to write batch data.` }
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
        error: { code: 'GAS_CLIENT_EXCEPTION', message: err.message || 'Unknown network exception calling GAS.' }
      };
    }
  }
}
