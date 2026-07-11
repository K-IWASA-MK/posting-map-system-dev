import { ApiRequest } from '../api/ApiRequest';
import { ApiExecutionContext } from '../gas/ApiExecutionContext';
import { ValidationResult } from './ValidationResult';

export interface Validator {
  readonly id: string;
  validate(request: ApiRequest, context: ApiExecutionContext): ValidationResult;
}
