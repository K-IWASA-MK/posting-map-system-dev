import { RepositoryUpdateRequest } from '../../application/task-result';
import { RepositoryExecutionContext } from './RepositoryExecutionContext';
import { RepositoryExecutionResult } from './RepositoryExecutionResult';
import { RepositoryDispatcher } from './RepositoryDispatcher';
import { RepositoryProviderType } from './RepositoryProviderType';

export class RepositoryRuntime {
  constructor(private dispatcher: RepositoryDispatcher) {}

  public async execute(
    request: RepositoryUpdateRequest,
    providerType: RepositoryProviderType = RepositoryProviderType.SPREADSHEET
  ): Promise<RepositoryExecutionResult> {
    // Generate correlationId and executionId for internal tracking if not provided
    const correlationId = request.metadata && (request.metadata as any).correlationId 
      ? (request.metadata as any).correlationId 
      : `corr-${Date.now()}`;
      
    const executionId = request.metadata && (request.metadata as any).executionId 
      ? (request.metadata as any).executionId 
      : `exec-${Date.now()}`;

    const context = new RepositoryExecutionContext({
      requestId: `req-${Date.now()}`,
      correlationId: correlationId,
      executionId: executionId,
      receivedAt: new Date(),
      request: request
    });

    try {
      const startTime = Date.now();
      const result = await this.dispatcher.dispatch(providerType, context);
      const durationMs = Date.now() - startTime;

      return new RepositoryExecutionResult({
        success: result.success,
        repositoryProvider: providerType,
        operationId: result.operationId,
        processedAt: new Date(),
        message: result.message,
        requestId: context.requestId,
        correlationId: context.correlationId,
        durationMs,
        retryCount: 0, // Placeholder for future retry mechanisms
        idempotencyApplied: false, // Default unless explicitly set by provider
        errorType: result.errorType
      });
    } catch (error: any) {
      return new RepositoryExecutionResult({
        success: false,
        repositoryProvider: providerType,
        operationId: 'unknown',
        processedAt: new Date(),
        message: `Failed to execute repository update: ${error.message}`,
        requestId: context.requestId,
        correlationId: context.correlationId,
        errorType: 'PROVIDER_ERROR' // Broad categorization for unhandled runtime throws
      });
    }
  }
}
