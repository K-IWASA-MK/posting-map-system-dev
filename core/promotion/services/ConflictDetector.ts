import { PromotionCandidate } from '../models/PromotionCandidate';
import { ConflictType } from '../models/PromotionEnums';
import { ConflictPolicy } from '../policy/ConflictPolicy';

export class ConflictDetector {
  constructor(private policy: ConflictPolicy) {}

  public detectConflicts(candidate: PromotionCandidate, plan: any): { hasConflict: boolean, type?: ConflictType, message?: string } {
    // Mock simulation: If the target domain contains "duplicate", simulate a DUPLICATE conflict
    if (candidate.knowledgeDomain === 'duplicate-domain') {
      return { hasConflict: true, type: ConflictType.DUPLICATE, message: 'Duplicate knowledge found in target domain' };
    }
    return { hasConflict: false };
  }
}
