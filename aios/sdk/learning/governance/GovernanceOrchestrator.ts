import { LearningPattern } from '../contracts';
import { IPatternRepository } from '../repository/IPatternRepository';
import { GovernanceRegistry } from './GovernanceRegistry';
import { GovernanceResult } from './GovernanceResult';
import { GovernanceDecision } from './GovernanceDecision';
import { IGovernanceOrchestrator } from './IGovernanceOrchestrator';
import { LearningPatternBuilder } from './LearningPatternBuilder';

export class GovernanceOrchestrator implements IGovernanceOrchestrator {
  constructor(
    private readonly registry: GovernanceRegistry,
    private readonly repository: IPatternRepository
  ) {}

  public async evaluateAndStore(patterns: ReadonlyArray<LearningPattern>): Promise<GovernanceResult> {
    const startTime = Date.now();
    const approvedPatterns: LearningPattern[] = [];
    const rejectedPatterns: LearningPattern[] = [];
    const decisions: GovernanceDecision[] = [];

    for (const pattern of patterns) {
      const policy = this.registry.getPolicy(pattern.patternType);
      
      if (!policy) {
        // No policy to evaluate, implicitly reject to be safe
        const noPolicyDecision: GovernanceDecision = {
          decisionId: `DEC-NOPOLICY-${Date.now()}`,
          approved: false,
          reason: `No governance policy found for PatternType ${pattern.patternType}`,
          policyId: 'SYSTEM',
          ruleResults: []
        };
        decisions.push(noPolicyDecision);
        rejectedPatterns.push(pattern);
        continue;
      }

      const result = policy.evaluate(pattern);
      decisions.push(result.decision);

      if (result.decision.approved && result.evaluation) {
        const approvedPattern = LearningPatternBuilder.buildApproved(pattern, result.decision, result.evaluation);
        approvedPatterns.push(approvedPattern);
        
        // Save to repository immediately upon approval
        await this.repository.save(approvedPattern);
      } else {
        rejectedPatterns.push(pattern);
      }
    }

    return Object.freeze({
      approvedPatterns: Object.freeze(approvedPatterns),
      rejectedPatterns: Object.freeze(rejectedPatterns),
      decisions: Object.freeze(decisions),
      durationMs: Date.now() - startTime
    });
  }
}
