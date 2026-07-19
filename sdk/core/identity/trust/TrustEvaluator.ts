import { TrustEvidence, TrustPolicy } from '../IdentityModels';

export class TrustEvaluator {
  public calculateScore(
    evidences: TrustEvidence[],
    policy: TrustPolicy,
    lastVerifiedAt: number
  ): number {
    if (evidences.length === 0) {
      return 100; // Default base trust
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const ev of evidences) {
      const weight = policy.weights[ev.source] !== undefined ? policy.weights[ev.source] : ev.weight;
      totalWeightedScore += ev.score * weight;
      totalWeight += weight;
    }

    let score = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 100;

    // Trust Decay implementation: reduce score based on elapsed time since last verified
    const hoursElapsed = (Date.now() - lastVerifiedAt) / 3600000;
    if (hoursElapsed > 0 && policy.decayModel && policy.decayModel.decayRatePerHour) {
      const decay = Math.floor(hoursElapsed * policy.decayModel.decayRatePerHour);
      score = Math.max(0, score - decay);
    }

    return Math.min(100, Math.max(0, score));
  }
}
