import { Validator } from '../Validator';
import { ApiRequest } from '../../api/ApiRequest';
import { ApiExecutionContext } from '../../gas/ApiExecutionContext';
import { ValidationResult } from '../ValidationResult';
import { ValidationError } from '../ValidationError';
import { RoutePolicy } from '../../api/RoutePolicy';

export class MethodValidator implements Validator {
  public readonly id = 'METHOD_VALIDATOR';

  public validate(request: ApiRequest, context: ApiExecutionContext): ValidationResult {
    const validatedAt = Date.now();

    if (!RoutePolicy.isMethodAllowed(request.method)) {
      return ValidationResult.failure(
        [{ code: ValidationError.INVALID_METHOD, message: `HTTP Method ${request.method} is not allowed.`, validatorId: this.id }],
        validatedAt,
        0
      );
    }

    return ValidationResult.success(validatedAt, 0);
  }
}
