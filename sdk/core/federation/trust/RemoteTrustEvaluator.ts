import { FederationTrustEvidence } from '../FederationModels';

export class RemoteTrustEvaluator {
  public calculateRemoteScore(evidences: FederationTrustEvidence[]): number {
    if (evidences.length === 0) return 100;

    let total = 0;
    for (const ev of evidences) {
      total += ev.score;
    }
    return Math.round(total / evidences.length);
  }
}
