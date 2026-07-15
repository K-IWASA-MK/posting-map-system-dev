import { IRepositoryRule } from './IRepositoryRule';
import { RepositoryManifest } from '../RepositoryManifest';
import { DevelopmentGovernanceDecision } from '../../governance/DevelopmentGovernanceDecision';
import { DevelopmentDecisionStatus } from '../../governance/DevelopmentDecisionStatus';
import { DevelopmentAction } from '../../governance/DevelopmentAction';
import { RepositoryNamingRule } from './RepositoryNamingRule';
import { RepositoryVisibilityRule } from './RepositoryVisibilityRule';
import { RepositoryOwnerRule } from './RepositoryOwnerRule';
import { RepositorySecretValidationRule } from './RepositorySecretValidationRule';

export class RepositoryPolicy {
  private rules: IRepositoryRule[] = [
    new RepositoryNamingRule(),
    new RepositoryVisibilityRule(),
    new RepositoryOwnerRule(),
    new RepositorySecretValidationRule(),
  ];

  public evaluate(manifest: RepositoryManifest): DevelopmentGovernanceDecision {
    let hasErrors = false;
    let allWarnings: string[] = [];
    let allErrors: string[] = [];

    for (const rule of this.rules) {
      const result = rule.validate(manifest);
      if (!result.valid) {
        hasErrors = true;
        allErrors = allErrors.concat(result.errors);
      }
      allWarnings = allWarnings.concat(result.warnings);
    }

    if (hasErrors) {
      return Object.freeze({
        decisionId: `REP-DEC-${Date.now()}`,
        decisionVersion: 'v1',
        status: DevelopmentDecisionStatus.FAILED,
        score: 0,
        confidence: 1.0,
        confidenceSource: 'RepositoryPolicy',
        action: DevelopmentAction.BLOCK,
        recommendations: [],
        reason: `Manifest validation failed: ${allErrors.join(', ')}`,
        generatedAt: new Date().toISOString()
      });
    }

    return Object.freeze({
      decisionId: `REP-DEC-${Date.now()}`,
      decisionVersion: 'v1',
      status: DevelopmentDecisionStatus.PASS,
      score: 100,
      confidence: 1.0,
      confidenceSource: 'RepositoryPolicy',
      action: DevelopmentAction.PROCEED,
      recommendations: [],
      reason: 'Manifest passed all repository policies.',
      generatedAt: new Date().toISOString()
    });
  }
}
