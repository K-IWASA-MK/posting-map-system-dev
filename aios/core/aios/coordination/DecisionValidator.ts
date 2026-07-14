import { FinalDecision } from "./FinalDecision";

export class DecisionValidator {
  public validate(decision: FinalDecision): boolean {
    if (decision.reason.risk === "CRITICAL" && decision.reason.confidence < 0.5) {
      return false; // Reject highly risky and low confidence decisions
    }
    return true;
  }
}
