import { PlacementPolicy, ResourceAllocation } from './models/OrchestrationModels';

export interface IPlacementStrategy {
  resolve(policy: PlacementPolicy, allocation: ResourceAllocation): string;
}

export class SpreadStrategy implements IPlacementStrategy {
  public resolve(policy: PlacementPolicy, allocation: ResourceAllocation): string {
    return 'node-spread-zone-' + (Math.floor(Math.random() * 3) + 1);
  }
}

export class BinpackStrategy implements IPlacementStrategy {
  public resolve(policy: PlacementPolicy, allocation: ResourceAllocation): string {
    return 'node-binpack-consolidated-1';
  }
}

export class AffinityStrategy implements IPlacementStrategy {
  public resolve(policy: PlacementPolicy, allocation: ResourceAllocation): string {
    return policy.affinity && policy.affinity.length > 0 ? policy.affinity[0] : 'node-affinity-default';
  }
}

export class AntiAffinityStrategy implements IPlacementStrategy {
  public resolve(policy: PlacementPolicy, allocation: ResourceAllocation): string {
    return 'node-antiaffinity-isolated';
  }
}

export class PlacementResolver {
  private strategies = new Map<string, IPlacementStrategy>();

  constructor() {
    this.strategies.set('SPREAD', new SpreadStrategy());
    this.strategies.set('BINPACK', new BinpackStrategy());
    this.strategies.set('AFFINITY', new AffinityStrategy());
    this.strategies.set('ANTI_AFFINITY', new AntiAffinityStrategy());
  }

  public resolvePlacement(policy: PlacementPolicy, allocation: ResourceAllocation): string {
    const strategy = this.strategies.get(policy.strategy);
    if (!strategy) {
      throw new Error(`Unsupported placement strategy: ${policy.strategy}`);
    }
    return strategy.resolve(policy, allocation);
  }
}
