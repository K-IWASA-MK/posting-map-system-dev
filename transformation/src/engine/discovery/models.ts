import { PluginManifest, PluginKind, PluginCapability, PluginOrigin } from '../../models/plugin';

/**
 * PluginDiscoveryRequest
 * 
 * Specifies the criteria for discovering plugins.
 */
export interface PluginDiscoveryRequest {
  readonly pluginId?: string;
  readonly kind?: PluginKind;
  readonly capabilities?: readonly PluginCapability[];
  readonly targetApiVersion?: string;
  readonly tags?: readonly string[];
}

/**
 * PluginCandidate
 * 
 * Represents a plugin discovered by a Source. It is NOT yet registered or loaded.
 * It carries metadata used by the RankingEngine and Selector.
 */
export interface PluginCandidate {
  readonly manifest: PluginManifest;
  readonly location: string; // File path, URI, Marketplace URL, etc.
  readonly source: PluginOrigin;
  readonly trust: number; // 0 to 100
  readonly priority: number; // Configured priority
  readonly score: number; // Computed by RankingEngine
}

/**
 * PluginFilter
 * 
 * A pure function that returns true if a Candidate satisfies arbitrary filtering criteria.
 */
export type PluginFilter = (candidate: PluginCandidate, request: PluginDiscoveryRequest) => boolean;

/**
 * PluginSelector
 * 
 * A pure function that selects the "best" candidate from a list of ranked candidates.
 */
export type PluginSelector = (candidates: readonly PluginCandidate[], request: PluginDiscoveryRequest) => PluginCandidate | undefined;
