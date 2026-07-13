import { GovernanceRuleResult } from '../contracts';
import * as crypto from 'crypto';

export class DecisionIdGenerator {
  public static generate(
    knowledgeId: string,
    policyId: string,
    ruleResults: ReadonlyArray<GovernanceRuleResult>
  ): string {
    const serialized = JSON.stringify({
      knowledgeId,
      policyId,
      rules: ruleResults.map(r => ({ id: r.ruleId, passed: r.passed }))
    });

    const hash = crypto.createHash('sha256')
      .update(serialized)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();

    return `DEC-K-${hash}`;
  }
}
