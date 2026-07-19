import { RuntimeRegistry } from '../registry/RuntimeRegistry';
import { RuntimeCapability } from '../RuntimeCapability';
import { RuntimeDescriptor } from '../RuntimeDescriptor';

export class RuntimeDiscovery {
  constructor(private readonly registry: RuntimeRegistry) {}

  public discover(): RuntimeDescriptor[] {
    return this.registry.list().map(entry => {
      // Map back to the new descriptor schema with Phase 4 additions
      return {
        runtimeId: entry.runtimeId,
        runtimeName: entry.runtime.descriptor.runtimeName,
        version: entry.runtimeVersion,
        contractVersion: entry.runtime.descriptor.contractVersion,
        capabilities: entry.capabilities,
        dependencies: entry.runtime.descriptor.dependencies,
        runtimeType: entry.runtimeType,
        runtimeVersion: entry.runtimeVersion,
        runtimeCapabilities: entry.capabilities,
        runtimeDependencies: entry.runtime.descriptor.dependencies,
        runtimePriority: entry.runtime.descriptor.metadata?.priority as number || 0,
        runtimeState: entry.stateMachine.getState()
      };
    });
  }

  public findByCapability(capability: RuntimeCapability): RuntimeDescriptor[] {
    return this.discover().filter(meta => meta.capabilities.includes(capability));
  }

  public findByType(runtimeType: string): RuntimeDescriptor[] {
    return this.discover().filter(meta => meta.runtimeType?.toLowerCase() === runtimeType.toLowerCase());
  }
}
