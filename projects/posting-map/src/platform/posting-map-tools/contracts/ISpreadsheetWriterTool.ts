import { EmployeeRecord } from '../../employee-runtime/registry/models/EmployeeRegistryModels';
import { TaskRecord } from '../../employee-runtime/task-assignment/models/TaskAssignmentModels';
import { SpreadsheetEvidence } from '../models/PostingMapToolModels';

export interface ISpreadsheetWriterTool {
  writeSpreadsheet(
    employee: EmployeeRecord,
    task: TaskRecord,
    csvData: string,
    expectedRowCount: number,
    gasWebAppUrl: string,
    apiKey?: string
  ): Promise<SpreadsheetEvidence>;
}
