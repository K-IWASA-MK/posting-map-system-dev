import { Validator } from '../Validator';
import { ApiRequest } from '../../api/ApiRequest';
import { ApiExecutionContext } from '../../gas/ApiExecutionContext';
import { ValidationResult } from '../ValidationResult';
import { ValidationError } from '../ValidationError';

export class RequestValidator implements Validator {
  public readonly id = 'REQUEST_VALIDATOR';

  public validate(request: ApiRequest, context: ApiExecutionContext): ValidationResult {
    const validatedAt = Date.now();
    
    if (!request) {
      return ValidationResult.failure(
        [{ code: ValidationError.INVALID_REQUEST, message: 'Request object is null or undefined.', validatorId: this.id }],
        validatedAt,
        0
      );
    }

    if (!request.method || !request.path || !request.requestId) {
      return ValidationResult.failure(
        [{ code: ValidationError.INVALID_REQUEST, message: 'Request method, path or requestId is missing.', validatorId: this.id }],
        validatedAt,
        0
      );
    }

    return ValidationResult.success(validatedAt, 0);
  }
}
