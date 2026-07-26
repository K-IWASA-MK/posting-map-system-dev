import { EmployeeRecord } from '../../employee-runtime/registry/models/EmployeeRegistryModels';
import { TaskRecord } from '../../employee-runtime/task-assignment/models/TaskAssignmentModels';
import { SpreadsheetEvidence } from '../models/PostingMapToolModels';

export interface ISpreadsheetWriterTool {
  duplicateTemplateSheet(
    spreadsheetId: string,
    sourceSheet: string,
    targetSheet: string,
    gasWebAppUrl: string,
    apiKey?: string
  ): Promise<boolean>;

  writeBatchSpreadsheet(
    employee: EmployeeRecord,
    task: TaskRecord,
    sheetName: string,
    csvData: string,
    expectedRowCount: number,
    gasWebAppUrl: string,
    apiKey?: string,
    spreadsheetId?: string
  ): Promise<SpreadsheetEvidence>;
}
