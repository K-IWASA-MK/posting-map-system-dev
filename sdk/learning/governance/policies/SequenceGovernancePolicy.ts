import { LearningPattern, PatternType } from '../../contracts';
import { IGovernancePolicy, PolicyEvaluationResult } from '../IGovernancePolicy';
import { RuleRegistry } from '../RuleRegistry';

export class SequenceGovernancePolicy implements IGovernancePolicy {
  public readonly policyId = 'POLICY-SEQ-STANDARD';
  public readonly targetPatternType = 'SEQUENCE';

  constructor(private readonly ruleRegistry: RuleRegistry) {}

  public evaluate(pattern: LearningPattern): PolicyEvaluationResult {
    if (pattern.patternType !== 'SEQUENCE') {
      throw new Error(`Invalid pattern type for SequenceGovernancePolicy: ${pattern.patternType}`);
    }

    const rules = this.ruleRegistry.getAllRules();
    const ruleResults = rules.map(rule => rule.evaluate(pattern.statistics));

    const allPassed = ruleResults.length > 0 && ruleResults.every(r => r.passed);
    
    let confidence = 0;
    let qualityScore = 0;
    let trustLevel = 'LOW';

    if (allPassed) {
      // Calculate subjective scores based on passing rules
      const occurrenceCount = pattern.statistics.occurrenceCount || 1;
      confidence = Math.min(0.5 + (occurrenceCount * 0.1), 0.99); // Simple formula
      qualityScore = Math.floor(confidence * 100);
      trustLevel = confidence > 0.8 ? 'HIGH' : 'MEDIUM';
    }

    return Object.freeze({
      decision: Object.freeze({
        decisionId: `DEC-SEQ-${Date.now()}`,
        approved: allPassed,
        reason: allPassed ? 'All sequence rules passed' : 'One or more sequence rules failed',
        policyId: this.policyId,
        ruleResults: Object.freeze(ruleResults)
      }),
      evaluation: allPassed ? Object.freeze({
        confidence,
        qualityScore,
        trustLevel,
        approvedAt: new Date().toISOString()
      }) : undefined
    });
  }
}
