import { ApiRequest } from '../api/ApiRequest';
import { ApiResponse } from '../api/ApiResponse';
import { ApiExecutionContext } from '../gas/ApiExecutionContext';
import { ExceptionMapper } from './ExceptionMapper';

export class ExceptionHandler {
  // S3-5 Integration: Event hook point for monitoring and audit logging
  private static onExceptionListeners: Array<
    (error: Error, request: ApiRequest, context: ApiExecutionContext) => void
  > = [];

  public static addListener(
    listener: (error: Error, request: ApiRequest, context: ApiExecutionContext) => void
  ): void {
    ExceptionHandler.onExceptionListeners.push(listener);
  }

  public static clearListeners(): void {
    ExceptionHandler.onExceptionListeners = [];
  }

  public static handle(
    error: Error,
    request: ApiRequest,
    context: ApiExecutionContext
  ): ApiResponse {
    // 1. Trigger monitoring and auditing hooks
    for (const listener of ExceptionHandler.onExceptionListeners) {
      try {
        listener(error, request, context);
      } catch (hookErr) {
        console.error('[ExceptionHandler Hook Error]', hookErr);
      }
    }

    // 2. Perform exception to ApiResponse mapping
    return ExceptionMapper.toResponse(error, request, context);
  }
}
