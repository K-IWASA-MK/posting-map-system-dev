import { NodeCapabilityProfile } from '../ExecutionToken';

export class LoadBalancer {
  private activeJobs = new Map<string, number>(); // NodeId -> active job count

  public incrementLoad(nodeId: string): void {
    const current = this.activeJobs.get(nodeId) || 0;
    this.activeJobs.set(nodeId, current + 1);
  }

  public decrementLoad(nodeId: string): void {
    const current = this.activeJobs.get(nodeId) || 0;
    this.activeJobs.set(nodeId, Math.max(0, current - 1));
  }

  public getLoad(nodeId: string): number {
    return this.activeJobs.get(nodeId) || 0;
  }

  public selectLeastLoadedNode(nodes: NodeCapabilityProfile[]): NodeCapabilityProfile {
    if (nodes.length === 0) {
      throw new Error('No candidate nodes provided for balancing');
    }
    
    // Sort by load ascending
    const sorted = [...nodes].sort((a, b) => {
      return this.getLoad(a.nodeId) - this.getLoad(b.nodeId);
    });

    return sorted[0];
  }
}
