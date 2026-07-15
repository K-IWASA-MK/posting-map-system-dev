import { IPatternStatistics } from '../contracts';
import { RuleResult } from './RuleResult';

export interface IGovernanceRule {
  readonly ruleId: string;
  evaluate(statistics: IPatternStatistics): RuleResult;
}
