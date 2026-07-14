import { PolicyRule } from "./PolicyRule";
import { PolicyContext } from "./PolicyContext";
import { PolicyProfile } from "./PolicyProfile";

export class PredictivePolicyRule implements PolicyRule {
  readonly id = "RULE-PRED-001";
  readonly priority = 100; // Emergency rule priority
  readonly precedence = "HIGH";
  readonly exclusive = true; // Emergency rule is exclusive
  readonly dependencies = [];

  evaluate(context: PolicyContext): PolicyProfile | null {
    const criticalPredictions = context.activePredictions.filter(p => p.risk === "CRITICAL");
    if (criticalPredictions.length > 0) {
      return PolicyProfile.EMERGENCY_RECOVERY;
    }
    return null;
  }
}
