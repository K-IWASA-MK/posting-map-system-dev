import { LearningSourceRegistry } from './LearningSourceRegistry';
import { LearningRequest } from './LearningRequest';
import { ResolverResult } from './ResolverResult';

export class LearningSourceResolver {
  private registry: LearningSourceRegistry;

  constructor(registry: LearningSourceRegistry) {
    this.registry = registry;
  }

  public resolve(request: LearningRequest): ResolverResult {
    const sources = this.registry.getAll();
    const matches = sources.filter(s => s.supports(request));

    if (matches.length === 0) {
      throw new Error(`Unresolved Source Error: No suitable source registered for ${request.sourceType}`);
    }

    // Filter by capabilities
    const capabilityMatched = matches.filter(s => {
      const cap = s.capability();
      if (request.executionId && !cap.supportsExecutionFilter) return false;
      if (request.correlationId && !cap.supportsCorrelationId) return false;
      if (request.timeRange && !cap.supportsTimeRange) return false;
      return true;
    });

    if (capabilityMatched.length === 0) {
      throw new Error(`Capability Mismatch Error: Registered sources for ${request.sourceType} lack required capabilities`);
    }

    const selected = capabilityMatched[0]; // Highest priority because list is pre-sorted

    return Object.freeze({
      source: selected,
      capability: selected.capability(),
      reason: `Successfully resolved source type ${request.sourceType} with priority ${selected.priority()}`
    });
  }
}
