import { IDiscoverySource } from '../interfaces';
import { PluginDiscoveryRequest, PluginCandidate } from '../models';
import { PluginOrigin } from '../../../models/plugin';
import { IMarketplaceProvider } from './interfaces';

/**
 * MarketplaceDiscoverySource
 * 
 * Implements IDiscoverySource to discover plugins from a specific Marketplace Provider.
 * Responsibilities:
 * - Delegates search to the IMarketplaceProvider.
 * - Converts MarketplacePackage to PluginCandidate.
 * - Enforces UNKNOWN trust (0) for Marketplace candidates (Trust Runtime will evaluate later).
 * - Isolates provider failures (returns empty candidates if provider fails).
 */
export class MarketplaceDiscoverySource implements IDiscoverySource {
  
  public readonly sourceName: string;

  constructor(
    private readonly provider: IMarketplaceProvider,
    private readonly priority: number = 50
  ) {
    this.sourceName = `Marketplace:${provider.providerName}`;
  }

  async discover(request: PluginDiscoveryRequest): Promise<readonly PluginCandidate[]> {
    try {
      // 1. Delegate search to provider
      const packages = await this.provider.search({
        query: request.pluginId,
        kind: request.kind,
        tags: request.tags
      });

      // 2. Convert MarketplacePackage to PluginCandidate
      return packages.map(pkg => ({
        manifest: pkg.manifest,
        // The location points to the marketplace package reference
        location: `marketplace://${this.provider.providerName}/${pkg.manifest.pluginId}/${pkg.manifest.version}`,
        source: PluginOrigin.MARKETPLACE,
        trust: 0, // MUST BE 0 (UNKNOWN). Trust Runtime (X-28) will determine actual trust.
        priority: this.priority,
        score: 0 // Will be computed by RankingEngine later
      }));
    } catch (error) {
      // Failure Isolation: If the provider throws an error, we gracefully return no candidates
      // so other sources (e.g., other marketplaces) can still be queried.
      console.error(`[MarketplaceDiscoverySource] Provider '${this.provider.providerName}' failed:`, error);
      return [];
    }
  }
}
