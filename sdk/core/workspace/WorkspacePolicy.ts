import { WorkspaceManifest } from "./WorkspaceManifest";
import { WorkspaceNamingRule } from "./rules/WorkspaceNamingRule";
import { WorkspaceDependencyRule } from "./rules/WorkspaceDependencyRule";
import { WorkspaceStructureRule } from "./rules/WorkspaceStructureRule";
import { WorkspaceSecretRule } from "./rules/WorkspaceSecretRule";

import { DevelopmentGovernanceDecision } from '../governance/DevelopmentGovernanceDecision';
import { DevelopmentDecisionStatus } from '../governance/DevelopmentDecisionStatus';
import { DevelopmentAction } from '../governance/DevelopmentAction';
import { RecommendationPriority } from '../governance/RecommendationPriority';

export class WorkspacePolicy {
  private namingRule = new WorkspaceNamingRule();
  private dependencyRule = new WorkspaceDependencyRule();
  private structureRule = new WorkspaceStructureRule();
  private secretRule = new WorkspaceSecretRule();

  public evaluate(manifest: WorkspaceManifest): DevelopmentGovernanceDecision {
    const violations = [
      ...this.namingRule.validate(manifest),
      ...this.dependencyRule.validate(manifest),
      ...this.structureRule.validate(manifest),
      ...this.secretRule.validate(manifest)
    ];

    if (violations.length > 0) {
      return {
        decisionId: `ws-policy-${Date.now()}`,
        decisionVersion: 'v1',
        status: DevelopmentDecisionStatus.FAILED,
        score: 0,
        confidence: 1.0,
        confidenceSource: 'System',
        action: DevelopmentAction.BLOCK,
        recommendations: [{
          id: `rec-${Date.now()}`,
          title: 'Fix Manifest',
          description: 'Fix manifest violations according to WorkspacePolicy.',
          priority: RecommendationPriority.HIGH,
          generatedAt: new Date().toISOString()
        }],
        reason: violations.join(' '),
        generatedAt: new Date().toISOString()
      };
    }

    return {
      decisionId: `ws-policy-${Date.now()}`,
      decisionVersion: 'v1',
      status: DevelopmentDecisionStatus.PASS,
      score: 100,
      confidence: 1.0,
      confidenceSource: 'System',
      action: DevelopmentAction.PROCEED,
      recommendations: [],
      reason: 'All workspace rules passed.',
      generatedAt: new Date().toISOString()
    };
  }
}
