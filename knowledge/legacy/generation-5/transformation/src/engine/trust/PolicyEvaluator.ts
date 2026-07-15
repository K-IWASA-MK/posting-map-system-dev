import { ITrustPolicyEvaluator } from './interfaces';
import { TrustLevel } from './models';

export class ProductionTrustPolicy implements ITrustPolicyEvaluator {
  evaluate(score: number): TrustLevel {
    if (score >= 100) return TrustLevel.CERTIFIED;
    if (score >= 70) return TrustLevel.TRUSTED;
    if (score >= 30) return TrustLevel.UNTRUSTED;
    return TrustLevel.UNKNOWN;
  }
}

export class StrictTrustPolicy implements ITrustPolicyEvaluator {
  evaluate(score: number): TrustLevel {
    if (score >= 100) return TrustLevel.CERTIFIED;
    // Strict policy: anything less than 100 is UNTRUSTED (if there is some score) or UNKNOWN
    if (score > 0) return TrustLevel.UNTRUSTED;
    return TrustLevel.UNKNOWN;
  }
}
