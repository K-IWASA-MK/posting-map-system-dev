import { RoutingContext } from "./RoutingContext";
import { RoutingPath } from "./RoutingPath";

export interface PriorityRoutingPolicy {
  readonly urgentPriorityThreshold: number;
  evaluate(context: RoutingContext): RoutingPath | null;
}
