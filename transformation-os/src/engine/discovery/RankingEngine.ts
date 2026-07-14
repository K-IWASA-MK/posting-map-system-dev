import { IPluginRankingEngine } from './interfaces';
import { PluginDiscoveryRequest, PluginCandidate } from './models';

/**
 * DefaultRankingEngine
 * 
 * Computes a score for each candidate based on how well it matches the request.
 * Pure function, no side effects.
 */
export class DefaultRankingEngine implements IPluginRankingEngine {
  
  rank(candidates: readonly PluginCandidate[], request: PluginDiscoveryRequest): readonly PluginCandidate[] {
    return candidates
      .map(candidate => {
        const score = this.calculateScore(candidate, request);
        return { ...candidate, score };
      })
      // Sort by score descending (highest score first)
      .sort((a, b) => b.score - a.score);
  }

  private calculateScore(candidate: PluginCandidate, request: PluginDiscoveryRequest): number {
    let score = 0;
    const manifest = candidate.manifest;

    // 1. Plugin ID Match (Strongest match)
    if (request.pluginId) {
      if (manifest.pluginId === request.pluginId) {
        score += 10000;
      } else {
        // Absolute mismatch if ID was specifically requested but doesn't match
        return -1; 
      }
    }

    // 2. Kind Match
    if (request.kind) {
      if (manifest.kind === request.kind) {
        score += 1000;
      } else {
        return -1; // Wrong kind
      }
    }

    // 3. Capabilities Match
    if (request.capabilities && request.capabilities.length > 0) {
      const hasAllCaps = request.capabilities.every(cap => manifest.capabilities.includes(cap));
      if (hasAllCaps) {
        score += 500 * request.capabilities.length;
      } else {
        return -1; // Missing required capability
      }
    }

    // 4. API Compatibility (If requested)
    if (request.targetApiVersion) {
      // In a real system we would use semver.
      // For now, if the target API version is exactly between min/max or matches them.
      if (request.targetApiVersion === manifest.minimumApiVersion || 
          request.targetApiVersion === manifest.maximumApiVersion) {
        score += 100;
      }
    }

    // 5. Version (Higher version gets slightly more points assuming lexical sort or numerical)
    // As a pure function proxy for version preference
    score += this.parseVersionWeight(manifest.version);

    // 6. Trust
    score += candidate.trust;

    // 7. Priority
    score += candidate.priority;

    return score;
  }

  private parseVersionWeight(version: string): number {
    // E.g. "1.2.3" -> 1 * 100 + 2 * 10 + 3 = 123 (Simplistic approach for ranking identical plugins)
    const parts = version.split('.').map(p => parseInt(p, 10)).filter(p => !isNaN(p));
    let weight = 0;
    if (parts[0]) weight += parts[0] * 100;
    if (parts[1]) weight += parts[1] * 10;
    if (parts[2]) weight += parts[2] * 1;
    return weight;
  }
}
