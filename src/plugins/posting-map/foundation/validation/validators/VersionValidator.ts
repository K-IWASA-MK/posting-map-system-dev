import { Validator } from '../Validator';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { ValidationResult } from '../ValidationResult';
import { ValidationError } from '../ValidationError';

export class VersionValidator implements Validator {
  public readonly id = 'VERSION_VALIDATOR';
  private static readonly SUPPORTED_VERSIONS: Set<string> = new Set(['v1', 'v2', 'v3', 'future']);

  public validate(request: ApiRequest, context: ApiExecutionContext): ValidationResult {
    const validatedAt = Date.now();

    if (!VersionValidator.SUPPORTED_VERSIONS.has(request.version)) {
      return ValidationResult.failure(
        [{ code: ValidationError.INVALID_VERSION, message: `API Version ${request.version} is not supported.`, validatorId: this.id }],
        validatedAt,
        0
      );
    }

    return ValidationResult.success(validatedAt, 0);
  }
}
