import { ApiException } from './ApiException';
import { SystemException } from './SystemException';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';

export class ExceptionMapper {
  public static toResponse(
    error: Error,
    request: ApiRequest,
    context: ApiExecutionContext
  ): ApiResponse {
    let apiException: ApiException;

    if (error instanceof ApiException) {
      apiException = error;
    } else {
      // JavaScript Standard error wrapper fallback
      apiException = new SystemException(
        error.message || String(error),
        request.requestId,
        error.stack
      );
    }

    const metadata = {
      requestId: request.requestId,
      serverTimestamp: apiException.metadata.timestamp,
      processingTime: context.getElapsedTime(),
      version: request.version,
      // Diagnostics metadata
      exception: {
        category: apiException.category,
        code: apiException.code,
        internalMessage: apiException.internalMessage
      }
    };

    return ApiResponse.errorResponse(
      apiException.code,
      apiException.externalMessage, // Client receives ONLY the safe user-facing message
      apiException.status,
      metadata
    );
  }
}
