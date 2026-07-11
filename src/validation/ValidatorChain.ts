import { Validator } from './Validator';
import { ApiRequest } from '../api/ApiRequest';
import { ApiExecutionContext } from '../gas/ApiExecutionContext';
import { ValidationResult } from './ValidationResult';

export class ValidatorChain implements Validator {
  public readonly id = 'VALIDATOR_CHAIN';
  private readonly validators: Validator[] = [];

  public addValidator(validator: Validator): ValidatorChain {
    this.validators.push(validator);
    return this;
  }

  public validate(request: ApiRequest, context: ApiExecutionContext): ValidationResult {
    const start = Date.now();

    for (const validator of this.validators) {
      const result = validator.validate(request, context);
      if (!result.valid) {
        // Fail-Fast: 最初のエラーで停止
        const duration = Date.now() - start;
        return ValidationResult.failure(result.errors, start, duration);
      }
    }

    const duration = Date.now() - start;
    return ValidationResult.success(start, duration);
  }
}
