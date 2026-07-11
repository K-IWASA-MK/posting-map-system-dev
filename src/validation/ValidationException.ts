import { ValidationResult } from './ValidationResult';
import { ValidationErrorCode } from './ValidationError';

export class ValidationException extends Error {
  public readonly result: ValidationResult;
  public readonly status: number;

  private static readonly ERROR_STATUS_MAP: Record<ValidationErrorCode, number> = {
    INVALID_REQUEST: 400,
    INVALID_METHOD: 405,
    INVALID_VERSION: 422,
    ROUTE_NOT_FOUND: 404,
    FEATURE_DISABLED: 422
  };

  constructor(result: ValidationResult) {
    const mainError = result.errors[0];
    const message = mainError
      ? `Validation failed at ${mainError.validatorId}: [${mainError.code}] ${mainError.message}`
      : 'Validation failed';
    super(message);
    this.name = 'ValidationException';
    this.result = result;

    const code = mainError ? mainError.code : 'INVALID_REQUEST';
    this.status = ValidationException.ERROR_STATUS_MAP[code] || 400;
  }
}
