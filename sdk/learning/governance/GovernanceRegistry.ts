import { PatternType } from '../contracts';
import { IGovernancePolicy } from './IGovernancePolicy';

export class GovernanceRegistry {
  private readonly policies = new Map<PatternType, IGovernancePolicy>();

  public register(policy: IGovernancePolicy): void {
    if (this.policies.has(policy.targetPatternType)) {
      throw new Error(`Policy for PatternType ${policy.targetPatternType} is already registered.`);
    }
    this.policies.set(policy.targetPatternType, policy);
  }

  public getPolicy(patternType: PatternType): IGovernancePolicy | undefined {
    return this.policies.get(patternType);
  }
}
