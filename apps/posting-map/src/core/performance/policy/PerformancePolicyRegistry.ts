import { IPerformancePolicy } from './PerformancePolicy';

export class PerformancePolicyRegistry {
  private static instance: PerformancePolicyRegistry;
  private policies: IPerformancePolicy[] = [];

  private constructor() {}

  public static getInstance(): PerformancePolicyRegistry {
    if (!PerformancePolicyRegistry.instance) {
      PerformancePolicyRegistry.instance = new PerformancePolicyRegistry();
    }
    return PerformancePolicyRegistry.instance;
  }

  public register(policy: IPerformancePolicy): void {
    if (!this.policies.some(p => p.id === policy.id)) {
      this.policies.push(policy);
    }
  }

  public clear(): void {
    this.policies = [];
  }

  public getPolicies(): IPerformancePolicy[] {
    return [...this.policies];
  }
}
