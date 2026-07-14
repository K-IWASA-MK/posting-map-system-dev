import { PolicyRegistry } from "./PolicyRegistry";
import { PolicyContext } from "./PolicyContext";
import { PolicyProfile } from "./PolicyProfile";
import { PolicyConflictResolver } from "./PolicyConflictResolver";
import { PolicyRecommendation } from "./PolicyRecommendation";
import { PolicyRule } from "./PolicyRule";

export class RuleEngine {
  constructor(private registry: PolicyRegistry, private resolver: PolicyConflictResolver) {}

  public evaluate(context: PolicyContext): PolicyRecommendation {
    const rules = this.registry.resolve();
    const evaluations: { rule: PolicyRule, profile: PolicyProfile }[] = [];

    for (const rule of rules) {
      const profile = rule.evaluate(context);
      if (profile) {
        evaluations.push({ rule, profile });
      }
    }

    const resolution = this.resolver.resolve(evaluations);

    // Create a recommendation based on the resolution
    return {
      recommendedProfile: resolution.winningProfile,
      confidence: 0.9,
      reason: `Applied rules: ${resolution.appliedRules.join(", ")}`,
      risk: "LOW",
      estimatedBenefit: 100
    };
  }
}
