import { PromotionCandidate } from '../models/PromotionCandidate';
import { PromotionPolicy } from '../policy/PromotionPolicy';
import { PromotionState } from '../models/PromotionEnums';

export class CandidateAssessmentService {
  constructor(private policy: PromotionPolicy) {}

  public assess(candidate: PromotionCandidate): boolean {
    if (candidate.qualityScore < this.policy.minQualityScore) return false;
    if (candidate.confidence < this.policy.minConfidence) return false;
    return true;
  }
}
