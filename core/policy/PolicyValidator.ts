import { PolicyRecommendation } from "./PolicyRecommendation";
import { PolicyContext } from "./PolicyContext";

export class PolicyValidator {
  public validate(recommendation: PolicyRecommendation, context: PolicyContext): boolean {
    // If system health is too low, we might not want to apply performance profiles
    if (context.systemHealth < 0.5 && recommendation.recommendedProfile === "MAX_PERFORMANCE") {
      return false;
    }
    return true;
  }
}
