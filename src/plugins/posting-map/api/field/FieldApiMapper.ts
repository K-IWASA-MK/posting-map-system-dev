import { ExceptionCategory } from '@core/exceptions/ExceptionCategory';
import { FieldApiException } from './FieldApiException';
import { ApiResponse } from '@core/api/ApiResponse';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';

export class FieldApiMapper {
  /**
   * Translates arbitrary domain/application errors into unified FieldApiException.
   */
  public static toApiException(error: Error, requestId: string): FieldApiException {
    const message = error.message || 'Unknown field operations error';
    
    // 404 Not Found mappings
    if (message.includes('not found') || message.includes('notFound')) {
      return new FieldApiException({
        category: ExceptionCategory.VALIDATION,
        code: 'ENTITY_NOT_FOUND',
        status: 404,
        internalMessage: message,
        externalMessage: message,
        requestId
      });
    }

    // 409 Conflict / Business Rule violations mappings
    if (
      message.includes('Insufficient stock') ||
      message.includes('Cannot reserve') ||
      message.includes('already exists') ||
      message.includes('depleted')
    ) {
      return new FieldApiException({
        category: ExceptionCategory.VALIDATION,
        code: 'BUSINESS_RULE_VIOLATION',
        status: 409,
        internalMessage: message,
        externalMessage: message,
        requestId
      });
    }

    // 400 Bad Request mappings (validation errors)
    if (
      message.includes('required') ||
      message.includes('must be') ||
      message.includes('cannot be negative') ||
      message.includes('empty')
    ) {
      return new FieldApiException({
        category: ExceptionCategory.VALIDATION,
        code: 'INVALID_INPUT',
        status: 400,
        internalMessage: message,
        externalMessage: message,
        requestId
      });
    }

    // Default Fallback: 500 Internal Server Error represented as ApiException
    return new FieldApiException({
      category: ExceptionCategory.SYSTEM,
      code: 'INTERNAL_SERVER_ERROR',
      status: 500,
      internalMessage: message,
      externalMessage: 'An internal server error occurred.',
      requestId
    });
  }

  /**
   * Helper to format a successful DTO into ApiResponse.
   */
  public static toSuccessResponse(data: any, request: ApiRequest, context: ApiExecutionContext): ApiResponse {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    return ApiResponse.successResponse(data, 200, metadata);
  }
}
