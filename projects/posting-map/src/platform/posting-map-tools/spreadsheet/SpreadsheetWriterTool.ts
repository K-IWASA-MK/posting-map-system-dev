import { ISpreadsheetWriterTool } from '../contracts/ISpreadsheetWriterTool';
import { SpreadsheetValidator } from './SpreadsheetValidator';
import { SpreadsheetEvidenceBuilder } from './SpreadsheetEvidenceBuilder';
import { GasWebAppClient } from '../gas/GasWebAppClient';
import { SpreadsheetEvidence } from '../models/PostingMapToolModels';
import { EmployeeRecord } from '../../employee-runtime/registry/models/EmployeeRegistryModels';
import { TaskRecord } from '../../employee-runtime/task-assignment/models/TaskAssignmentModels';

export class SpreadsheetWriterTool implements ISpreadsheetWriterTool {
  private validator = new SpreadsheetValidator();
  private evidenceBuilder = new SpreadsheetEvidenceBuilder();
  private gasClient: GasWebAppClient;

  constructor(gasClient?: GasWebAppClient) {
    this.gasClient = gasClient || new GasWebAppClient();
  }

  public async writeSpreadsheet(
    employee: EmployeeRecord,
    task: TaskRecord,
    csvData: string,
    expectedRowCount: number,
    gasWebAppUrl: string,
    apiKey?: string
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

    // 3. GAS Adapter invocation
    const result = await this.gasClient.postSpreadsheetData(gasWebAppUrl, csvData, apiKey);
    if (!result.success || !result.spreadsheetId) {
      throw new Error(
        `[GAS Execution Error] Failed to write spreadsheet via GAS WebApp. Error: ${result.error?.message || 'Unknown Error'}`
      );
    }

    // 4. Evidence generation
    const evidence = this.evidenceBuilder.buildEvidence(
      result.spreadsheetId,
      csvData,
      result.sheetCount || 5
    );

    return evidence;
  }
}
