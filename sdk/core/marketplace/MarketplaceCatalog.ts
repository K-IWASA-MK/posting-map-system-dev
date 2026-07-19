import { MarketplaceRegistry } from './MarketplaceRegistry';
import { MarketplaceEntry, MarketplaceReview } from '../service/ServiceModels';

export class MarketplaceCatalog {
  constructor(private readonly registry: MarketplaceRegistry) {}

  public publishEntry(entry: MarketplaceEntry): void {
    this.registry.registerEntry(entry);
  }

  public unpublishEntry(entryId: string): void {
    this.registry.removeEntry(entryId);
  }

  public addReview(review: MarketplaceReview): void {
    this.registry.addReview(review);
    
    // Update calculated rating
    const entry = this.registry.getEntryByService(review.serviceId);
    if (entry) {
      const reviews = this.registry.getReviews(review.serviceId);
      const total = reviews.reduce((sum, r) => sum + r.qualityScore, 0);
      const average = total / reviews.length;
      
      this.registry.registerEntry({
        ...entry,
        rating: Math.round(average * 10) / 10
      });
    }
  }
}
