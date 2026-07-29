import { RepositoryProvider } from '../runtime/repository/RepositoryProvider';
import { RepositoryExecutionContext } from '../runtime/repository/RepositoryExecutionContext';
import { RepositoryResult, RepositoryErrorType } from './RepositoryResult';
import { SpreadsheetWriteExecutor } from './spreadsheet/SpreadsheetWriteExecutor';
import { SpreadsheetWriteContext } from './spreadsheet/SpreadsheetWriteContext';

export class SpreadsheetRepositoryAdapter implements RepositoryProvider {
  constructor(private executor: SpreadsheetWriteExecutor) {}

  public async execute(context: RepositoryExecutionContext): Promise<RepositoryResult> {
    const writeContext = new SpreadsheetWriteContext({
      request: context.request,
      sheetName: '', // Resolved within Executor via Resolver
      rowKey: '', // Handled by Mapper/Resolver
      idempotencyKey: context.request.idempotencyKey,
      requestId: context.requestId,
      correlationId: context.correlationId,
      executionId: context.executionId
    });

    try {
      const result = await this.executor.execute(writeContext);

      // Map back to RepositoryResult contract
      return {
        success: result.success,
        operationId: result.operationId,
        message: result.message,
        errorType: result.errorType as RepositoryErrorType,
        details: {
          isIdempotentSkip: result.isIdempotentSkip,
          processedAt: result.processedAt
        }
      };
    } catch (error: any) {
      return {
        success: false,
        operationId: `fail-${context.executionId}`,
        message: error.message,
        errorType: RepositoryErrorType.PROVIDER_ERROR
      };
    }
  }
}
