import { PerformanceValidationResult } from '../validation/PerformanceValidationResult';
import { PerformanceGovernancePolicy } from './PerformanceGovernancePolicy';
import { PerformanceGovernanceResult } from './PerformanceGovernanceResult';

export class PerformanceGovernanceEngine {
  private policy: PerformanceGovernancePolicy;

  constructor() {
    this.policy = new PerformanceGovernancePolicy();
  }

  public evaluate(validationResult: PerformanceValidationResult): PerformanceGovernanceResult {
    const decision = this.policy.evaluate(validationResult.summary);

    return {
      metadata: validationResult.metadata,
      decision,
      validationResult
    };
  }
}
