import { DevelopmentGovernanceInput } from './DevelopmentGovernanceInput';
import { DevelopmentGovernanceResult } from './DevelopmentGovernanceResult';
import { DevelopmentGovernancePolicy } from './DevelopmentGovernancePolicy';

export class DevelopmentGovernanceEngine {
  private policy: DevelopmentGovernancePolicy;

  constructor() {
    this.policy = new DevelopmentGovernancePolicy();
  }

  public evaluate(input: DevelopmentGovernanceInput): DevelopmentGovernanceResult {
    const decision = this.policy.evaluate(input);

    let totalCosts = 0;
    if (input.validationResult) {
      totalCosts += input.validationResult.actualCost;
    }

    const inputSummary = {
      validationEvaluated: input.validationResult !== null,
      totalReviewers: input.reviewResults ? input.reviewResults.length : 0,
      totalCosts
    };

    return Object.freeze({
      decision,
      metadata: Object.freeze({ evaluatedBy: 'DevelopmentGovernanceEngine', version: '1.0' }),
      inputSummary: Object.freeze(inputSummary)
    });
  }
}
