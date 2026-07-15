import { DevelopmentContext } from '../context/DevelopmentContext';
import { IReviewer } from './IReviewer';
import { ReviewerRegistry } from './ReviewerRegistry';

export interface ReviewerSelectionResult {
  readonly reviewer: IReviewer;
  readonly selectionReason: string;
}

export class ReviewerLoader {
  /**
   * Finds the optimal list of reviewers sorted by Priority and Weight, and attaches the reason.
   */
  public findOptimal(registry: ReviewerRegistry, context: DevelopmentContext): ReviewerSelectionResult[] {
    const supported = registry.findSupported(context);

    // Sort by priority (higher is better) first, then by weight (higher is better)
    const sorted = supported.sort((a, b) => {
      if (a.metadata.priority !== b.metadata.priority) {
        return b.metadata.priority - a.metadata.priority;
      }
      return b.metadata.weight - a.metadata.weight;
    });

    return sorted.map((reviewer, index) => {
      let reason = 'Fallback Selection';
      if (index === 0) {
        reason = 'Highest Priority & Weight';
      }
      return Object.freeze({
        reviewer,
        selectionReason: reason
      });
    });
  }
}
