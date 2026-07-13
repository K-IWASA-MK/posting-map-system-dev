import { RuntimeCapability } from '../../runtime/RuntimeCapability';

export interface ICapabilityResolver {
  resolve(capability: RuntimeCapability): string | null;
}

export class CapabilityResolver implements ICapabilityResolver {
  private readonly capabilityMap: Map<RuntimeCapability, string> = new Map();

  constructor() {
    // Standard OS Runtime Capabilities Registration
    this.capabilityMap.set(RuntimeCapability.CAN_CREATE_REPOSITORY, 'aios.repository');
    this.capabilityMap.set(RuntimeCapability.CAN_RELEASE, 'aios.release');
    this.capabilityMap.set(RuntimeCapability.CAN_DEPLOY, 'aios.deployment');
    this.capabilityMap.set(RuntimeCapability.CAN_PLAN, 'aios.project');
    this.capabilityMap.set(RuntimeCapability.CAN_DISCOVER, 'aios.workspace');
    this.capabilityMap.set(RuntimeCapability.CAN_BUILD, 'aios.deployment'); // Often handled by deployment/build job
    this.capabilityMap.set(RuntimeCapability.CAN_TEST, 'aios.deployment');
  }

  public register(capability: RuntimeCapability, runtimeId: string): void {
    this.capabilityMap.set(capability, runtimeId);
  }

  public resolve(capability: RuntimeCapability): string | null {
    return this.capabilityMap.get(capability) || null;
  }
}
