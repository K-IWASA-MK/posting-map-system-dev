import { KnowledgeAsset, KnowledgeEvaluation } from '../../contracts';
import { IGovernancePolicy, PolicyEvaluationResult } from '../IGovernancePolicy';
import { KnowledgeRuleRegistry } from '../KnowledgeRuleRegistry';
import { DecisionIdGenerator } from '../DecisionIdGenerator';

export class SequenceKnowledgeGovernancePolicy implements IGovernancePolicy {
  public readonly policyId = 'POLICY-K-SEQ-STANDARD';
  public readonly targetPluginId = 'aios.knowledge.plugin.sequence';

  constructor(private readonly ruleRegistry: KnowledgeRuleRegistry) {}

  public evaluate(asset: KnowledgeAsset): PolicyEvaluationResult {
    const rules = this.ruleRegistry.getAllRules();
    const ruleResults = rules.map(rule => rule.evaluate(asset));

    const passedRuleCount = ruleResults.filter(r => r.passed).length;
    const ruleCount = ruleResults.length;
    const allPassed = ruleCount > 0 && passedRuleCount === ruleCount;
    
    let confidence = 0;
    let quality = 0;
    let trustLevel = 'LOW';

    if (allPassed) {
      const nodesCount = asset.semantic.nodes.length;
      const edgesCount = asset.semantic.edges.length;

      confidence = Math.min(0.6 + (nodesCount * 0.05) + (edgesCount * 0.02), 0.99);
      quality = Math.min(0.5 + (edgesCount * 0.1), 0.95);
      trustLevel = confidence > 0.8 ? 'HIGH' : 'MEDIUM';
    }

    // Deterministic DecisionId (Blocker 1)
    const decisionId = DecisionIdGenerator.generate(asset.knowledgeId, this.policyId, ruleResults);

    return Object.freeze({
      decision: Object.freeze({
        decisionId,
        approved: allPassed,
        reason: allPassed ? 'All sequence governance rules passed' : 'One or more sequence governance rules failed',
        policyId: this.policyId,
        ruleResults: Object.freeze(ruleResults),
        ruleCount,
        passedRuleCount
      }),
      evaluation: allPassed ? Object.freeze({
        confidence,
        quality,
        trustLevel,
        ruleResults: Object.freeze(ruleResults)
      }) : undefined
    });
  }
}
