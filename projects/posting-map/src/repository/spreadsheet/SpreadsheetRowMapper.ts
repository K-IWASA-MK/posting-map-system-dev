import { SpreadsheetWriteContext } from './SpreadsheetWriteContext';
import { TaskSheetSchema } from './SpreadsheetSchema';

export class SpreadsheetRowMapper {
  /**
   * Maps a request context into a row array representation based on the Schema.
   * If existingRowData is provided, it updates only the relevant fields and bumps the version.
   */
  public mapToRow(context: SpreadsheetWriteContext, existingRowData?: any[]): any[] {
    const row: any[] = existingRowData ? [...existingRowData] : [];
    
    // Ensure array is large enough
    const maxIndex = Math.max(...Object.values(TaskSheetSchema.COLUMNS));
    while (row.length <= maxIndex) {
      row.push('');
    }

    row[TaskSheetSchema.COLUMNS.TASK_ID] = context.request.taskId;
    row[TaskSheetSchema.COLUMNS.STATUS] = context.request.status;
    row[TaskSheetSchema.COLUMNS.COMPLETED_AT] = context.request.completedAt ? context.request.completedAt.toISOString() : '';
    row[TaskSheetSchema.COLUMNS.EXECUTION_ID] = context.executionId;
    row[TaskSheetSchema.COLUMNS.IDEMPOTENCY_KEY] = context.idempotencyKey;
    row[TaskSheetSchema.COLUMNS.LAST_UPDATED] = new Date().toISOString();
    
    // Optimistic Concurrency: Bump version if updating, otherwise 1
    const currentVersion = existingRowData ? (parseInt(existingRowData[TaskSheetSchema.COLUMNS.VERSION], 10) || 0) : 0;
    row[TaskSheetSchema.COLUMNS.VERSION] = currentVersion + 1;

    return row;
  }
}
