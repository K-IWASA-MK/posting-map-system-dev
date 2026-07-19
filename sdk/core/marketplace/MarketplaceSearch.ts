import { MarketplaceRegistry } from './MarketplaceRegistry';
import { MarketplaceEntry } from '../service/ServiceModels';

export class MarketplaceSearch {
  constructor(private readonly registry: MarketplaceRegistry) {}

  public searchByCategory(category: string): MarketplaceEntry[] {
    return this.registry.getEntries().filter(
      e => e.category.toLowerCase() === category.toLowerCase() && e.status === 'PUBLISHED'
    );
  }

  public getHighRatingEntries(minRating = 4.0): MarketplaceEntry[] {
    return this.registry.getEntries().filter(
      e => e.rating >= minRating && e.status === 'PUBLISHED'
    );
  }
}
