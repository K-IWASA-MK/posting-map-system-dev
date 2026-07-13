import { PromotionCandidate } from '../models/PromotionCandidate';

export class MergePlanner {
  public planMerge(candidate: PromotionCandidate): any {
    return {
      candidateId: candidate.candidateId,
      targetKnowledge: candidate.targetKnowledge,
      strategy: 'REPLACE',
      plannedAt: new Date()
    };
  }
}
