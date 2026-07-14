import { ResourceAllocation } from "./ResourceAllocation";
import { ResourceRequirement } from "./ResourceRequirement";
import { ResourcePool } from "./ResourcePool";
import { ResourceQuota } from "./ResourceQuota";

export class ResourceValidator {
  public validateReservation(requirement: ResourceRequirement, pool: ResourcePool, quota: ResourceQuota): boolean {
    if (requirement.requiredTokens > pool.tokenTotal) return false;
    if (requirement.requiredTokens > quota.runtimeQuota) return false;
    return true;
  }

  public validateAllocation(allocation: ResourceAllocation, requirement: ResourceRequirement): boolean {
    return allocation.allocatedTokens >= requirement.requiredTokens;
  }
}
