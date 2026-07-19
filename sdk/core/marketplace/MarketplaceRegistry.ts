import { MarketplaceEntry, MarketplaceReview } from '../service/ServiceModels';

export class MarketplaceRegistry {
  private entries = new Map<string, MarketplaceEntry>();
  private reviews = new Map<string, MarketplaceReview[]>();

  public registerEntry(entry: MarketplaceEntry): void {
    this.entries.set(entry.entryId, entry);
  }

  public getEntry(entryId: string): MarketplaceEntry | undefined {
    return this.entries.get(entryId);
  }

  public getEntryByService(serviceId: string): MarketplaceEntry | undefined {
    return Array.from(this.entries.values()).find(
      e => e.serviceId === serviceId && e.status === 'PUBLISHED'
    );
  }

  public getEntries(): MarketplaceEntry[] {
    return Array.from(this.entries.values());
  }

  public removeEntry(entryId: string): void {
    const entry = this.entries.get(entryId);
    if (entry) {
      this.entries.set(entryId, {
        ...entry,
        status: 'UNPUBLISHED'
      });
    }
  }

  public addReview(review: MarketplaceReview): void {
    const list = this.reviews.get(review.serviceId) || [];
    list.push(review);
    this.reviews.set(review.serviceId, list);
  }

  public getReviews(serviceId: string): MarketplaceReview[] {
    return this.reviews.get(serviceId) || [];
  }
}
