import { NodeCapabilityProfile } from './ExecutionToken';

export class NodeSelector {
  private nodes = new Map<string, NodeCapabilityProfile>();

  public registerNode(profile: NodeCapabilityProfile): void {
    this.nodes.set(profile.nodeId, profile);
  }

  public selectBestNode(
    requiredCapability: string,
    minTrustScore: number,
    requiredRuntimeClass: string
  ): NodeCapabilityProfile {
    const candidates = Array.from(this.nodes.values()).filter((node) => {
      return (
        node.trustScore >= minTrustScore &&
        node.runtimeCapabilities.includes(requiredCapability) &&
        node.runtimeClasses.includes(requiredRuntimeClass)
      );
    });

    if (candidates.length === 0) {
      throw new Error(`No nodes available matching requirements: trust >= ${minTrustScore}, capability: ${requiredCapability}`);
    }

    // Sort by trust score descending, then by CPU capacity descending
    candidates.sort((a, b) => {
      if (b.trustScore !== a.trustScore) {
        return b.trustScore - a.trustScore;
      }
      return b.cpu - a.cpu;
    });

    return candidates[0];
  }
}
