import { PromotionCandidate } from '../models/PromotionCandidate';

export class MergeSimulator {
  public simulate(candidate: PromotionCandidate, plan: any): any {
    return {
      success: true,
      simulatedArtifacts: [...candidate.artifacts, 'merged-artifact'],
      simulatedAt: new Date()
    };
  }
}
