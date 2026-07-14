import { PolicyRule } from "./PolicyRule";
import { PolicyProfile } from "./PolicyProfile";

export interface ConflictResolution {
  readonly winningProfile: PolicyProfile;
  readonly appliedRules: string[];
  readonly rejectedRules: string[];
}

export class PolicyConflictResolver {
  public resolve(ruleEvaluations: { rule: PolicyRule, profile: PolicyProfile }[]): ConflictResolution {
    if (ruleEvaluations.length === 0) {
      return { winningProfile: PolicyProfile.BALANCED, appliedRules: [], rejectedRules: [] };
    }

    // Sort by priority (higher number = higher priority)
    const sorted = [...ruleEvaluations].sort((a, b) => b.rule.priority - a.rule.priority);
    
    // Check exclusive rules first
    const exclusiveRule = sorted.find(e => e.rule.exclusive);
    if (exclusiveRule) {
      return {
        winningProfile: exclusiveRule.profile,
        appliedRules: [exclusiveRule.rule.id],
        rejectedRules: sorted.filter(e => e.rule.id !== exclusiveRule.rule.id).map(e => e.rule.id)
      };
    }

    // Otherwise pick the highest priority
    const winner = sorted[0];
    return {
      winningProfile: winner.profile,
      appliedRules: [winner.rule.id],
      rejectedRules: sorted.slice(1).map(e => e.rule.id)
    };
  }
}
