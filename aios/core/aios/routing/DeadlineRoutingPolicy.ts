import { RoutingContext } from "./RoutingContext";
import { RoutingPath } from "./RoutingPath";

export interface DeadlineRoutingPolicy {
  evaluate(context: RoutingContext): RoutingPath | null;
}
