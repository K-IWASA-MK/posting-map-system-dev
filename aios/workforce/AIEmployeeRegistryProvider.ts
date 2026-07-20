import { AIEmployeeRegistry } from './AIEmployeeRegistry';
import { AIEmployeeRegistration } from './AIEmployeeRegistration';
import { AIEmployeeLookupRequest } from './AIEmployeeLookupRequest';
import { AIEmployeeLookupResponse } from './AIEmployeeLookupResponse';

export interface AIEmployeeRegistryProvider {
  register(registration: AIEmployeeRegistration): AIEmployeeRegistry;
  lookup(request: AIEmployeeLookupRequest): AIEmployeeLookupResponse;
  list(): AIEmployeeRegistry;
}
