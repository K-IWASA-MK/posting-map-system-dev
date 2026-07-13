import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { ValidationResult } from './ValidationResult';

export interface Validator {
  readonly id: string;
  validate(request: ApiRequest, context: ApiExecutionContext): ValidationResult;
}
