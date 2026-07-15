import { PromotionState } from '../models/PromotionEnums';

export class PromotionStateMachine {
  private allowedTransitions: Record<PromotionState, PromotionState[]> = {
    [PromotionState.CREATED]: [PromotionState.ASSESSING, PromotionState.ARCHIVED],
    [PromotionState.ASSESSING]: [PromotionState.QUALITY_CHECK, PromotionState.REJECTED],
    [PromotionState.QUALITY_CHECK]: [PromotionState.CONFLICT_ANALYSIS, PromotionState.REJECTED],
    [PromotionState.CONFLICT_ANALYSIS]: [PromotionState.READY, PromotionState.REJECTED],
    [PromotionState.READY]: [PromotionState.VERSIONING, PromotionState.REJECTED],
    [PromotionState.VERSIONING]: [PromotionState.PROMOTING, PromotionState.REJECTED],
    [PromotionState.PROMOTING]: [PromotionState.PROMOTED, PromotionState.REJECTED],
    [PromotionState.PROMOTED]: [PromotionState.ARCHIVED],
    [PromotionState.REJECTED]: [PromotionState.ARCHIVED],
    [PromotionState.ARCHIVED]: []
  };

  public canTransition(current: PromotionState, next: PromotionState): boolean {
    return this.allowedTransitions[current]?.includes(next) ?? false;
  }
}
