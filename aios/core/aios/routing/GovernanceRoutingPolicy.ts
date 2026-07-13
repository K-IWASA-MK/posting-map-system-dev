import { RoutingContext } from "./RoutingContext";
import { RoutingPath } from "./RoutingPath";

export interface GovernanceRoutingPolicy {
  readonly strictValidationThreshold: number;
  readonly manualReviewThreshold: number;
  evaluate(context: RoutingContext): RoutingPath | null;
}
