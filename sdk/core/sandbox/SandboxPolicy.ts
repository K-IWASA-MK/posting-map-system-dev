import { ContainerDefinition } from '../container/ContainerDefinition';
import { FilesystemPolicy } from './FilesystemPolicy';
import { NetworkPolicy } from './NetworkPolicy';
import { CapabilityFilter } from './CapabilityFilter';
import { StandardIsolationProfiles, IsolationProfileType } from './IsolationProfile';

export interface PolicyValidationResult {
  success: boolean;
  reason?: string;
}

export class SandboxPolicy {
  private readonly fsPolicy = new FilesystemPolicy();
  private readonly netPolicy = new NetworkPolicy();
  private readonly capFilter = new CapabilityFilter();

  public evaluateContainerPolicy(
    definition: ContainerDefinition,
    stages: { identityPassed: boolean; trustPassed: boolean; securityPassed: boolean }
  ): PolicyValidationResult {
    // 1. Identity (Evaluation order index 1)
    if (!stages.identityPassed) {
      return { success: false, reason: 'Evaluation Blocked: Identity verification failed.' };
    }

    // 2. Trust (Evaluation order index 2)
    if (!stages.trustPassed) {
      return { success: false, reason: 'Evaluation Blocked: Trust score insufficient.' };
    }

    // 3. Security (Evaluation order index 3)
    if (!stages.securityPassed) {
      return { success: false, reason: 'Evaluation Blocked: Security audit block.' };
    }

    // 4. SandboxPolicy (Evaluation order index 4)
    const profileType = definition.sandboxProfile as IsolationProfileType;
    const profile = StandardIsolationProfiles[profileType];
    if (!profile) {
      return { success: false, reason: `Evaluation Blocked: Invalid runtime profile "${definition.sandboxProfile}"` };
    }

    // Validate volumes using FilesystemPolicy
    for (const vol of definition.volumes) {
      if (!this.fsPolicy.validate(profile.readOnlyFilesystem, vol)) {
        return { success: false, reason: `Evaluation Blocked: Filesystem write attempt blocked on readonly path "${vol}"` };
      }
    }

    // Validate network
    if (!profile.allowNetwork && definition.network !== 'none') {
      return { success: false, reason: 'Evaluation Blocked: Outbound network request blocked by policy' };
    }

    return { success: true };
  }

  public getCapabilityFilter(): CapabilityFilter {
    return this.capFilter;
  }
}
