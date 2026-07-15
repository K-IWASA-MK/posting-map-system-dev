import { PluginDiscoveryRequest, PluginCandidate } from './models';

/**
 * IDiscoverySource
 * 
 * Represents a single source of plugins (e.g., Local File System, Marketplace, Git, etc.).
 * Responsible ONLY for finding candidates and assigning base metadata (location, source, priority).
 */
export interface IDiscoverySource {
  readonly sourceName: string;
  discover(request: PluginDiscoveryRequest): Promise<readonly PluginCandidate[]>;
}

/**
 * IPluginRankingEngine
 * 
 * Pure scoring engine that evaluates candidates against the discovery request.
 * Does not load or register plugins.
 */
export interface IPluginRankingEngine {
  rank(candidates: readonly PluginCandidate[], request: PluginDiscoveryRequest): readonly PluginCandidate[];
}

/**
 * IPluginSelector
 * 
 * Selects the best candidate(s) from a ranked list.
 * Does not load or register plugins.
 */
export interface IPluginSelector {
  select(rankedCandidates: readonly PluginCandidate[], request: PluginDiscoveryRequest): PluginCandidate | undefined;
  selectAll(rankedCandidates: readonly PluginCandidate[], request: PluginDiscoveryRequest): readonly PluginCandidate[];
}

/**
 * IPluginDiscovery (Coordinator)
 * 
 * The main entry point for the OS to discover plugins.
 * Implementations (like PluginResolver) coordinate Sources, RankingEngine, and Selector.
 */
export interface IPluginDiscovery {
  discoverBest(request: PluginDiscoveryRequest): Promise<PluginCandidate | undefined>;
  discoverAll(request: PluginDiscoveryRequest): Promise<readonly PluginCandidate[]>;
}
