import { ApiRequest } from '@core/api/ApiRequest';
import { AuthenticationResult } from './AuthenticationResult';

export interface IdentityProvider {
  authenticate(request: ApiRequest): AuthenticationResult;
}
