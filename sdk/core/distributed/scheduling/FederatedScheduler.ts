import { NodeCapabilityProfile } from '../ExecutionToken';
import { LoadBalancer } from './LoadBalancer';

export enum SchedulingStrategyType {
  BINPACK = 'BINPACK',
  ROUND_ROBIN = 'ROUND_ROBIN'
}

export class FederatedScheduler {
  private lastRoundRobinIndex = 0;
  private readonly loadBalancer = new LoadBalancer();

  public schedule(
    nodes: NodeCapabilityProfile[],
    strategy: SchedulingStrategyType
  ): NodeCapabilityProfile {
    if (nodes.length === 0) {
      throw new Error('No target nodes to schedule execution on');
    }

    if (strategy === SchedulingStrategyType.ROUND_ROBIN) {
      const targetIndex = this.lastRoundRobinIndex % nodes.length;
      this.lastRoundRobinIndex++;
      const targetNode = nodes[targetIndex];
      this.loadBalancer.incrementLoad(targetNode.nodeId);
      return targetNode;
    } else {
      // BINPACK: select least loaded node to balance resource packing
      const targetNode = this.loadBalancer.selectLeastLoadedNode(nodes);
      this.loadBalancer.incrementLoad(targetNode.nodeId);
      return targetNode;
    }
  }

  public getLoadBalancer(): LoadBalancer {
    return this.loadBalancer;
  }
}
