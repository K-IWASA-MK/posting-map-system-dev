import { RoutingPath } from "./RoutingPath";
import { RoutingContext } from "./RoutingContext";
import { AdaptiveRoutingPolicy } from "./AdaptiveRoutingPolicy";

export class PathValidator {
  constructor(private policy: AdaptiveRoutingPolicy) {}

  public validate(path: RoutingPath, context: RoutingContext): boolean {
    return this.policy.safetyPolicy.evaluate(context, path);
  }
}
