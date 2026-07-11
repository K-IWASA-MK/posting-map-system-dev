import { ApiExecutionContext } from '../gas/ApiExecutionContext';
import { GuardResult } from './RequestGuard';

export class ResourceGuard {
  // Max default execution time limit before premature exit (e.g. 25 seconds for GAS 30-sec execution sandbox limit)
  private static readonly TIME_LIMIT_MS = 25000;

  public static check(context: ApiExecutionContext): GuardResult {
    if (context.getElapsedTime() > ResourceGuard.TIME_LIMIT_MS) {
      return {
        allowed: false,
        reason: `System execution time exceeded resource sandbox limit of ${ResourceGuard.TIME_LIMIT_MS}ms`,
        status: 500
      };
    }
    return { allowed: true };
  }
}
