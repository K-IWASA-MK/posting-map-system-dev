import { AdaptiveRoutingPolicy } from "./AdaptiveRoutingPolicy";
import { RoutingContext } from "./RoutingContext";
import { RoutingPath } from "./RoutingPath";

export class PolicyResolver {
  constructor(private policy: AdaptiveRoutingPolicy) {}

  public resolve(context: RoutingContext): RoutingPath[] {
    const candidates: RoutingPath[] = [];
    
    const trustPath = this.policy.trustPolicy.evaluate(context);
    if (trustPath) candidates.push(trustPath);
    
    const govPath = this.policy.governancePolicy.evaluate(context);
    if (govPath) candidates.push(govPath);
    
    const loadPath = this.policy.loadPolicy.evaluate(context);
    if (loadPath) candidates.push(loadPath);
    
    return candidates;
  }
}
