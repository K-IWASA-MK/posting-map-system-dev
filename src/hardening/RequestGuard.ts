import { ApiRequest } from '../api/ApiRequest';

export interface GuardResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly status?: number;
}

export class RequestGuard {
  private static readonly MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB default
  private static readonly MAX_PARAMS_COUNT = 100;

  public static check(request: ApiRequest): GuardResult {
    // 1. Check Query parameter limits
    if (request.query && Object.keys(request.query).length > RequestGuard.MAX_PARAMS_COUNT) {
      return {
        allowed: false,
        reason: `Parameter count exceeds limit of ${RequestGuard.MAX_PARAMS_COUNT}`,
        status: 400
      };
    }

    // 2. Check Request Body limits (Size Checks)
    if (request.body) {
      const bodyStr = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
      if (bodyStr.length > RequestGuard.MAX_BODY_SIZE) {
        return {
          allowed: false,
          reason: `Payload too large. Exceeds limit of ${RequestGuard.MAX_BODY_SIZE} bytes`,
          status: 413
        };
      }
    }

    return { allowed: true };
  }
}
