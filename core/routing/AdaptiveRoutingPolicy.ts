import { LoadRoutingPolicy } from "./LoadRoutingPolicy";
import { TrustRoutingPolicy } from "./TrustRoutingPolicy";
import { GovernanceRoutingPolicy } from "./GovernanceRoutingPolicy";
import { PriorityRoutingPolicy } from "./PriorityRoutingPolicy";
import { SafetyRoutingPolicy } from "./SafetyRoutingPolicy";
import { DeadlineRoutingPolicy } from "./DeadlineRoutingPolicy";

export interface AdaptiveRoutingPolicy {
  readonly loadPolicy: LoadRoutingPolicy;
  readonly trustPolicy: TrustRoutingPolicy;
  readonly governancePolicy: GovernanceRoutingPolicy;
  readonly priorityPolicy: PriorityRoutingPolicy;
  readonly safetyPolicy: SafetyRoutingPolicy;
  readonly deadlinePolicy: DeadlineRoutingPolicy;
}
