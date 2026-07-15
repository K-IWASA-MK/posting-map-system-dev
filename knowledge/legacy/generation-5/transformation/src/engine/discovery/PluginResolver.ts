import { IPluginDiscovery, IDiscoverySource, IPluginRankingEngine, IPluginSelector } from './interfaces';
import { PluginDiscoveryRequest, PluginCandidate } from './models';

/**
 * PluginResolver
 * 
 * Coordinator for the Plugin Discovery subsystem.
 * It aggregates multiple IDiscoverySources, uses a RankingEngine to score them,
 * and uses a Selector to pick the best match.
 * 
 * Flow: Source -> RankingEngine -> Selector
 */
export class PluginResolver implements IPluginDiscovery {
  
  constructor(
    private readonly sources: readonly IDiscoverySource[],
    private readonly rankingEngine: IPluginRankingEngine,
    private readonly selector: IPluginSelector
  ) {}

  async discoverBest(request: PluginDiscoveryRequest): Promise<PluginCandidate | undefined> {
    const candidates = await this.gatherCandidates(request);
    const ranked = this.rankingEngine.rank(candidates, request);
    return this.selector.select(ranked, request);
  }

  async discoverAll(request: PluginDiscoveryRequest): Promise<readonly PluginCandidate[]> {
    const candidates = await this.gatherCandidates(request);
    const ranked = this.rankingEngine.rank(candidates, request);
    return this.selector.selectAll(ranked, request);
  }

  private async gatherCandidates(request: PluginDiscoveryRequest): Promise<readonly PluginCandidate[]> {
    const allCandidates: PluginCandidate[] = [];

    // Query all sources concurrently
    const promises = this.sources.map(source => source.discover(request));
    const results = await Promise.all(promises);

    for (const batch of results) {
      allCandidates.push(...batch);
    }

    return allCandidates;
  }
}
