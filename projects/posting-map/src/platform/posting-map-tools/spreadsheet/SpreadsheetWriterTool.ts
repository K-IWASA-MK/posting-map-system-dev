import { ISpreadsheetWriterTool } from '../contracts/ISpreadsheetWriterTool';
import { SpreadsheetValidator } from './SpreadsheetValidator';
import { SpreadsheetEvidenceBuilder } from './SpreadsheetEvidenceBuilder';
import { GasWebAppClient } from '../gas/GasWebAppClient';
import { SpreadsheetEvidence } from '../models/PostingMapToolModels';
import { EmployeeRecord } from '../../employee-runtime/registry/models/EmployeeRegistryModels';
import { TaskRecord } from '../../employee-runtime/task-assignment/models/TaskAssignmentModels';
import { POSTING_MAP_TEMPLATE } from '../contracts/PostingMapTemplateContract';

export class SpreadsheetWriterTool implements ISpreadsheetWriterTool {
  private validator = new SpreadsheetValidator();
  private evidenceBuilder = new SpreadsheetEvidenceBuilder();
  private gasClient: GasWebAppClient;

  constructor(gasClient?: GasWebAppClient) {
    this.gasClient = gasClient || new GasWebAppClient();
  }

  public async duplicateTemplateSheet(
    spreadsheetId: string,
    sourceSheet: string,
    targetSheet: string,
    gasWebAppUrl: string,
    apiKey?: string
  ): Promise<boolean> {
    // 1. Parameter validations
    if (sourceSheet !== '原本') {
      throw new Error(`[Duplicate Sheet Block] Source sheet must be '原本'.`);
    }
    const namePattern = /^[^（\(\)]+(?:（\d+）)?$/;
    if (targetSheet !== '区割り' && !namePattern.test(targetSheet)) {
      throw new Error(`[Duplicate Sheet Block] Invalid target sheet name format: ${targetSheet}`);
    }

    const result = await this.gasClient.duplicateTemplateSheet(
      gasWebAppUrl,
      spreadsheetId,
      sourceSheet,
      targetSheet,
      apiKey
    );
    if (!result.success) {
      throw new Error(
        `[GAS Execution Error] Failed to duplicate sheet via GAS WebApp. Error: ${result.error?.message || 'Unknown Error'}`
      );
    }
    return true;
  }

  public async writeBatchSpreadsheet(
    employee: EmployeeRecord,
    task: TaskRecord,
    sheetName: string,
    csvData: string,
    expectedRowCount: number,
    gasWebAppUrl: string,
    apiKey?: string,
    spreadsheetId?: string
  ): Promise<SpreadsheetEvidence> {
    // 1. Input Validation (Verify row count and header matching)
    this.validator.validateCsvInput(csvData, expectedRowCount);

    // 2. Tool Permission check (Verify allowedTools whitelist in Task Contract)
    const toolName = 'spreadsheet_writer';
    if (!task.allowedTools.includes(toolName)) {
      throw new Error(
        `[Tool Permission Block] Employee '${employee.employeeId}' with role '${employee.roleId}' is NOT permitted to use tool '${toolName}'. Allowed tools: [${task.allowedTools.join(', ')}]`
      );
    }

    // 3. Template Contract Check
    const namePattern = /^[^（\(\)]+(?:（\d+）)?$/;
    if (sheetName !== '区割り' && !namePattern.test(sheetName)) {
      throw new Error(
        `[Contract Violation] Target sheet '${sheetName}' is not a valid municipality batch sheet name.`
      );
    }

    // 4. Transform Address Master CSV to Posting Map Template format
    const convertedCsv = this.convertToPostingMapTemplate(csvData);

    // 5. GAS Adapter invocation
    const result = await this.gasClient.postBatchSpreadsheetData(
      gasWebAppUrl,
      sheetName,
      convertedCsv,
      expectedRowCount,
      apiKey,
      spreadsheetId
    );
    if (!result.success || !result.spreadsheetId) {
      throw new Error(
        `[GAS Execution Error] Failed to write batch spreadsheet via GAS WebApp. Error: ${result.error?.message || 'Unknown Error'}`
      );
    }

    // 6. Evidence generation
    const evidence = this.evidenceBuilder.buildEvidence(
      result.spreadsheetId,
      csvData, // Evidence is built from raw source address count/data
      result.sheetCount || 5
    );

    return evidence;
  }

  private convertToPostingMapTemplate(rawCsv: string): string {
    const lines = rawCsv.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return '';
    
    const header = this.parseCsvRow(lines[0]);
    const fullAddrIdx = header.indexOf('full_address');
    const cityIdx = header.indexOf('自治体名') !== -1 ? header.indexOf('自治体名') : header.indexOf('city_name');
    const townIdx = header.indexOf('町名/大字') !== -1 ? header.indexOf('町名/大字') : header.indexOf('town_name');
    const detailIdx = header.indexOf('丁目/詳細') !== -1 ? header.indexOf('丁目/詳細') : header.indexOf('detail');

    // Template columns: 住所, 地図, メモ, 完了, 日付, 枚数, 担当
    const outputRows = [['住所', '地図', 'メモ', '完了', '日付', '枚数', '担当']];

    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCsvRow(lines[i]);
      let address = '';
      if (fullAddrIdx !== -1) {
        address = row[fullAddrIdx] || '';
      } else if (cityIdx !== -1 && townIdx !== -1) {
        address = (row[cityIdx] || '') + (row[townIdx] || '') + (detailIdx !== -1 ? row[detailIdx] || '' : '');
      } else {
        address = row[0] || '';
      }
      outputRows.push([address.trim(), '', '', '', '', '', '']);
    }

    return outputRows.map(r => r.map(cell => {
      return cell.includes(',') ? `"${cell}"` : cell;
    }).join(',')).join('\n');
  }

  private parseCsvRow(rowText: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
}
