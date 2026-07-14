import { PolicyRule } from "./PolicyRule";
import { PolicyContext } from "./PolicyContext";
import { PolicyProfile } from "./PolicyProfile";

export class OptimizationPolicyRule implements PolicyRule {
  readonly id = "RULE-OPT-001";
  readonly priority = 50;
  readonly precedence = "NORMAL";
  readonly exclusive = false;
  readonly dependencies = [];

  evaluate(context: PolicyContext): PolicyProfile | null {
    if (context.environmentVector.optimizationDebt > 0.8) {
      return PolicyProfile.MAX_PERFORMANCE;
    }
    return null;
  }
}
