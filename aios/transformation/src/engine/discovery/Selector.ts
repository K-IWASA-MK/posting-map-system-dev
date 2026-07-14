import { IPluginSelector } from './interfaces';
import { PluginDiscoveryRequest, PluginCandidate } from './models';

/**
 * DefaultPluginSelector
 * 
 * Simple selector that picks the highest scoring candidate that hasn't been rejected by the ranking engine.
 */
export class DefaultPluginSelector implements IPluginSelector {
  
  select(rankedCandidates: readonly PluginCandidate[], request: PluginDiscoveryRequest): PluginCandidate | undefined {
    // Candidates are already ranked. We just pick the first one with score >= 0.
    return rankedCandidates.find(c => c.score >= 0);
  }

  selectAll(rankedCandidates: readonly PluginCandidate[], request: PluginDiscoveryRequest): readonly PluginCandidate[] {
    // Return all candidates that haven't been rejected
    return rankedCandidates.filter(c => c.score >= 0);
  }
}
