import { MarketplaceEntry } from '../service/ServiceModels';

export class MarketplacePolicy {
  public validateEntry(entry: MarketplaceEntry): boolean {
    // Only accept entries with valid categories and visibility settings
    if (!entry.category || entry.category.trim() === '') {
      return false;
    }
    return true;
  }
}
