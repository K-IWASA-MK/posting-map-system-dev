import { RoutingContext } from "./RoutingContext";
import { RoutingPath } from "./RoutingPath";

export interface LoadRoutingPolicy {
  readonly maxNormalLoad: number;
  readonly throttleThreshold: number;
  evaluate(context: RoutingContext): RoutingPath | null;
}
