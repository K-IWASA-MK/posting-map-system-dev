import { RoutingPath } from "./RoutingPath";
import { RoutingContext } from "./RoutingContext";
import { PolicyResolver } from "./PolicyResolver";

export class PathDeterminer {
  constructor(private resolver: PolicyResolver) {}

  public determine(context: RoutingContext): RoutingPath {
    const candidates = this.resolver.resolve(context);
    
    if (candidates.includes(RoutingPath.BLOCKED)) return RoutingPath.BLOCKED;
    if (candidates.includes(RoutingPath.STRICT_VALIDATION_PATH)) return RoutingPath.STRICT_VALIDATION_PATH;
    if (candidates.includes(RoutingPath.MANUAL_REVIEW_PATH)) return RoutingPath.MANUAL_REVIEW_PATH;
    if (candidates.includes(RoutingPath.THROTTLED_PATH)) return RoutingPath.THROTTLED_PATH;
    if (candidates.includes(RoutingPath.FAST_TRACK)) return RoutingPath.FAST_TRACK;
    
    return RoutingPath.STANDARD_PATH;
  }
}
