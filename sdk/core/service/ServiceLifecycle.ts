import { ServiceDefinition } from './ServiceModels';

export class ServiceLifecycle {
  private serviceStates = new Map<string, 'STOPPED' | 'STARTING' | 'RUNNING' | 'FAILED'>();

  public startService(service: ServiceDefinition): void {
    this.serviceStates.set(service.serviceId, 'RUNNING');
  }

  public stopService(serviceId: string): void {
    this.serviceStates.set(serviceId, 'STOPPED');
  }

  public getServiceState(serviceId: string): 'STOPPED' | 'STARTING' | 'RUNNING' | 'FAILED' {
    return this.serviceStates.get(serviceId) || 'STOPPED';
  }

  public handleHealthViolation(serviceId: string, isHealthy: boolean): void {
    if (!isHealthy) {
      this.serviceStates.set(serviceId, 'FAILED');
      this.stopService(serviceId); // Force stop on health failures
    }
  }
}
