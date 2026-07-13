import { ApiException } from '@core/exceptions/ApiException';
import { ExceptionCategory } from '@core/exceptions/ExceptionCategory';
import { ValidationResult } from './ValidationResult';

export class ValidationException extends ApiException {
  public readonly category = ExceptionCategory.VALIDATION;
  public readonly code = 'PM-VAL-001';
  public readonly status: number;
  public readonly result: ValidationResult;

  private static readonly ERROR_STATUS_MAP: Record<string, number> = {
    INVALID_REQUEST: 400,
    INVALID_METHOD: 405,
    INVALID_VERSION: 422,
    ROUTE_NOT_FOUND: 404,
    FEATURE_DISABLED: 422
  };

  constructor(result: ValidationResult) {
    const mainError = result.errors[0];
    const internalMessage = mainError
      ? `Validation failed at ${mainError.validatorId}: [${mainError.code}] ${mainError.message}`
      : 'Validation failed';

    const errCode = mainError ? mainError.code : 'INVALID_REQUEST';
    const status = ValidationException.ERROR_STATUS_MAP[errCode] || 422;

    super({
      internalMessage,
      externalMessage: '入力パラメータの検証に失敗しました。',
      metadata: {
        requestId: result.metadata.validatedAt.toString(), // context fallback in construct
        timestamp: result.metadata.validatedAt,
        exceptionType: 'ValidationException',
        exceptionCode: 'PM-VAL-001',
        source: mainError ? mainError.validatorId : 'VALIDATOR_CHAIN',
        details: mainError ? mainError.message : undefined
      }
    });

    this.status = status;
    this.result = result;
  }
}
