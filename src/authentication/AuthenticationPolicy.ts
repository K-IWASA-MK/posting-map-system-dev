import { ApiRequest } from '../api/ApiRequest';

export class AuthenticationPolicy {
  public static isAnonymousAllowed(request: ApiRequest): boolean {
    // 1. Health check or non-authenticated endpoints allow anonymous
    if (request.path === '/health') {
      return true;
    }
    // 2. Allow fallback logic or configured global policy
    return false;
  }

  public static isInternalOnly(request: ApiRequest): boolean {
    // Internal batch or admin endpoints
    if (request.path === '/batch' || request.path === '/admin') {
      return true;
    }
    return false;
  }
}
