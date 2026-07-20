import { AIEmployeeRequest } from './AIEmployeeRequest';
import { AIEmployeeResponse } from './AIEmployeeResponse';

export interface AIEmployeeProvider {
  registerEmployee(request: AIEmployeeRequest): AIEmployeeResponse;
}
