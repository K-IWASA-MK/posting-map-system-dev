import { SpreadsheetWriteContext } from './SpreadsheetWriteContext';
import { SpreadsheetWriteResult } from './SpreadsheetWriteResult';
import { SpreadsheetGateway } from './SpreadsheetGateway';
import { SpreadsheetSheetResolver } from './SpreadsheetSheetResolver';
import { SpreadsheetRowMapper } from './SpreadsheetRowMapper';
import { TaskSheetSchema } from './SpreadsheetSchema';

export class SpreadsheetWriteExecutor {
  constructor(
    private gateway: SpreadsheetGateway,
    private resolver: SpreadsheetSheetResolver,
    private mapper: SpreadsheetRowMapper
  ) {}

  public async execute(context: SpreadsheetWriteContext): Promise<SpreadsheetWriteResult> {
    const sheetName = this.resolver.resolveSheetName(context.request);
    
    // Determine the row key based on taskId
    const key = context.request.taskId;
    
    // Find if the row already exists
    const rowIndex = await this.gateway.findRowIndex(sheetName, TaskSheetSchema.COLUMNS.TASK_ID, key);
    
    if (rowIndex !== null) {
      // Row exists, verify idempotency and version
      const existingRow = await this.gateway.readRow(sheetName, rowIndex);
      if (existingRow) {
        const existingIdempotencyKey = existingRow[TaskSheetSchema.COLUMNS.IDEMPOTENCY_KEY];
        
        if (existingIdempotencyKey === context.idempotencyKey) {
          return new SpreadsheetWriteResult({
            success: true,
            operationId: `skip-${context.executionId}`,
            requestId: context.requestId,
            correlationId: context.correlationId,
            processedAt: new Date(),
            message: 'Write skipped due to idempotency match',
            isIdempotentSkip: true
          });
        }
        
        // Optimistic Concurrency Check
        // If metadata contains expectedVersion, we could check it here. 
        // For now, assume if the record exists but idempotency key doesn't match, we overwrite it and bump version.
        // In a strict OCC scenario, we would throw a CONCURRENCY_ERROR if expectedVersion != currentVersion.
        const expectedVersion = context.request.metadata && (context.request.metadata as any).expectedVersion;
        const currentVersion = parseInt(existingRow[TaskSheetSchema.COLUMNS.VERSION], 10) || 0;
        
        if (expectedVersion !== undefined && expectedVersion !== currentVersion) {
          return new SpreadsheetWriteResult({
            success: false,
            operationId: `fail-${context.executionId}`,
            requestId: context.requestId,
            correlationId: context.correlationId,
            processedAt: new Date(),
            errorType: 'CONCURRENCY_ERROR',
            message: `Version mismatch. Expected: ${expectedVersion}, Actual: ${currentVersion}`
          });
        }

        const rowData = this.mapper.mapToRow(context, existingRow);
        await this.gateway.updateRow(sheetName, rowIndex, rowData);
      }
    } else {
      // New row
      const rowData = this.mapper.mapToRow(context);
      await this.gateway.appendRow(sheetName, rowData);
    }

    await this.gateway.flush();

    return new SpreadsheetWriteResult({
      success: true,
      operationId: `op-${context.executionId}`,
      requestId: context.requestId,
      correlationId: context.correlationId,
      processedAt: new Date(),
      message: 'Write completed successfully'
    });
  }
}
