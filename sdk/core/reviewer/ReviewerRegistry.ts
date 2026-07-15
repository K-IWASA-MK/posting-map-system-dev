import { IReviewer } from './IReviewer';
import { DevelopmentContext } from '../context/DevelopmentContext';
import { DevelopmentReviewerId } from './DevelopmentReviewerId';

export class ReviewerRegistry {
  private reviewers: Map<DevelopmentReviewerId | string, IReviewer> = new Map();

  public register(reviewer: IReviewer): void {
    const id = reviewer.metadata.id;
    if (this.reviewers.has(id)) {
      throw new Error(`Reviewer with id '${id}' is already registered.`);
    }
    this.reviewers.set(id, reviewer);
  }

  public findAll(): IReviewer[] {
    return Array.from(this.reviewers.values());
  }

  public findById(id: DevelopmentReviewerId | string): IReviewer | undefined {
    return this.reviewers.get(id);
  }

  public findSupported(context: DevelopmentContext): IReviewer[] {
    return this.findAll().filter(r => r.supports(context));
  }

  public clear(): void {
    this.reviewers.clear();
  }
}
