import { PromotionCandidate } from '../models/PromotionCandidate';
import { KnowledgeVersion } from '../models/KnowledgeVersion';

export class PromotionWriter {
  public commitPromotion(candidate: PromotionCandidate, version: KnowledgeVersion, simulatedMerge: any): void {
    // In foundation, this is a mock action.
    // In later phases, this writes the merged artifacts to the target Knowledge Storage.
  }
}
