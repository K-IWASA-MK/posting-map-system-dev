import { RoutingContext } from "./RoutingContext";
import { RoutingPath } from "./RoutingPath";

export interface TrustRoutingPolicy {
  readonly minFastTrackTrust: number;
  readonly minStandardTrust: number;
  evaluate(context: RoutingContext): RoutingPath | null;
}
