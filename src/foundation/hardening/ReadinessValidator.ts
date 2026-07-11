import { ProductionReadinessPolicy } from './ProductionReadinessPolicy';
import { GuardResult } from './RequestGuard';

export class ReadinessValidator {
  public static validate(): GuardResult {
    const result = ProductionReadinessPolicy.verify();
    if (!result.ready) {
      return {
        allowed: false,
        reason: `Production setup readiness failure: ${result.reason || 'UNKNOWN'}`,
        status: 500
      };
    }
    return { allowed: true };
  }
}
