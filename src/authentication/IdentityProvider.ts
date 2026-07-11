import { ApiRequest } from '../api/ApiRequest';
import { AuthenticationResult } from './AuthenticationResult';

export interface IdentityProvider {
  authenticate(request: ApiRequest): AuthenticationResult;
}
