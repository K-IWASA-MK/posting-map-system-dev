import { RoutingContext } from "./RoutingContext";
import { RoutingPath } from "./RoutingPath";

export interface SafetyRoutingPolicy {
  evaluate(context: RoutingContext, proposedPath: RoutingPath): boolean;
}
