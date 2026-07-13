import { IGovernanceRule } from '../IGovernanceRule';
import { KnowledgeAsset, GovernanceRuleResult } from '../../contracts';

export class MinimumNodesCountRule implements IGovernanceRule {
  public readonly ruleId = 'aios.knowledge.rule.min_nodes_count';

  public evaluate(asset: KnowledgeAsset): GovernanceRuleResult {
    const nodeCount = asset.semantic.nodes.length;
    const passed = nodeCount >= 2;

    return Object.freeze({
      ruleId: this.ruleId,
      passed,
      reason: passed 
        ? `Passed node count check (nodes: ${nodeCount})`
        : `Rejected: semantic graph must contain at least 2 nodes, got ${nodeCount}`
    });
  }
}
