import { IPatternStatistics } from '../../contracts';
import { IGovernanceRule } from '../IGovernanceRule';
import { RuleResult } from '../RuleResult';

export class MinimumOccurrenceRule implements IGovernanceRule {
  public readonly ruleId = 'RULE-MIN-OCCURRENCE';

  constructor(private readonly minThreshold: number = 2) {}

  public evaluate(statistics: IPatternStatistics): RuleResult {
    const passed = statistics.occurrenceCount >= this.minThreshold;
    return Object.freeze({
      ruleId: this.ruleId,
      passed,
      reason: passed 
        ? `Occurrence count ${statistics.occurrenceCount} meets minimum threshold of ${this.minThreshold}.`
        : `Occurrence count ${statistics.occurrenceCount} is below minimum threshold of ${this.minThreshold}.`,
      metadata: { threshold: this.minThreshold, actual: statistics.occurrenceCount }
    });
  }
}
