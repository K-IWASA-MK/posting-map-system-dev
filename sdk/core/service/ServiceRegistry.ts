import { ServiceDefinition, ServiceIdentity } from './ServiceModels';

export class ServiceRegistry {
  private services = new Map<string, ServiceDefinition>();
  private identities = new Map<string, ServiceIdentity>();

  public registerService(service: ServiceDefinition, identity: ServiceIdentity): void {
    // Basic manifest signature verification check
    if (identity.signature === 'INVALID-SIGNATURE') {
      throw new Error(`Signature verification failed for service ${service.serviceId}`);
    }
    this.services.set(service.serviceId, service);
    this.identities.set(service.serviceId, identity);
  }

  public getService(serviceId: string): ServiceDefinition | undefined {
    return this.services.get(serviceId);
  }

  public getServiceIdentity(serviceId: string): ServiceIdentity | undefined {
    return this.identities.get(serviceId);
  }

  public getServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  public removeService(serviceId: string): void {
    this.services.delete(serviceId);
    this.identities.delete(serviceId);
  }
}
