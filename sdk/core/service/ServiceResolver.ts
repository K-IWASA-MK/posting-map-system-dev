import { ServiceDependency, ServiceDefinition } from './ServiceModels';
import { ServiceRegistry } from './ServiceRegistry';

export class ServiceResolver {
  private dependencies = new Map<string, ServiceDependency[]>();

  public registerDependencies(serviceId: string, deps: ServiceDependency[]): void {
    this.dependencies.set(serviceId, deps);
  }

  public getDependencies(serviceId: string): ServiceDependency[] {
    return this.dependencies.get(serviceId) || [];
  }

  public resolveDependencies(serviceId: string, registry: ServiceRegistry): ServiceDefinition[] {
    const deps = this.dependencies.get(serviceId) || [];
    const resolved: ServiceDefinition[] = [];

    for (const d of deps) {
      const target = registry.getService(d.dependsOn);
      if (!target) {
        throw new Error(`Missing service dependency: service ${serviceId} depends on service ${d.dependsOn} but it was not found`);
      }
      resolved.push(target);
    }

    return resolved;
  }
}
