import { ITrustEvaluator } from './ITrustEvaluator';
import { TrustEvidence } from './TrustEvidence';
import { TrustEvaluation } from './TrustEvaluation';
import { TrustLevel } from './TrustLevel';
import { TrustPolicy } from './TrustPolicy';

/**
 * TrustEvaluator performs pure mathematical deduction to compute trust values.
 * Conforms to: Depends only on immutable evidence. Does not spawn or publish events.
 */
export class TrustEvaluator implements ITrustEvaluator {
  /**
   * Computes score and trust level from evidence.
   * @param evidence Context indicators.
   */
  public evaluate(evidence: TrustEvidence): TrustEvaluation {
    let scoreValue = 100;
    const reasons: string[] = [];

    if (!evidence.signatureValid) {
      scoreValue -= TrustPolicy.PENALTY_INVALID_SIGNATURE;
      reasons.push(`Invalid signature penalty: -${TrustPolicy.PENALTY_INVALID_SIGNATURE} pts`);
    }

    const permissionDenials = evidence.monitoringView.getPermissionDenialsCount(evidence.pluginId);
    if (permissionDenials > 0) {
      const penalty = permissionDenials * TrustPolicy.PENALTY_PERMISSION_DENIED;
      scoreValue -= penalty;
      reasons.push(`Permission denials penalty (${permissionDenials} count): -${penalty} pts`);
    }

    const locksBlocked = evidence.monitoringView.getWorkspaceLocksBlockedCount(evidence.projectId);
    if (locksBlocked > 0) {
      const penalty = locksBlocked * TrustPolicy.PENALTY_WORKSPACE_LOCKED;
      scoreValue -= penalty;
      reasons.push(`Workspace locking collisions penalty (${locksBlocked} count): -${penalty} pts`);
    }

    if (scoreValue < 0) {
      scoreValue = 0;
    }

    let level: TrustLevel = 'untrusted';
    if (scoreValue >= TrustPolicy.MINIMUM_TRUSTED_SCORE) {
      level = 'trusted';
    } else if (scoreValue >= TrustPolicy.MINIMUM_SANDBOX_SCORE) {
      level = 'sandboxed';
    }

    return {
      score: {
        value: scoreValue,
        level
      },
      reasons
    };
  }
}
