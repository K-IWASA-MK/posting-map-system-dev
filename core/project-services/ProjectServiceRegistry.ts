import { IProjectService } from './IProjectService';

/**
 * ProjectServiceRegistry acts as a pure Service Locator.
 * It is responsible for registering, looking up, and batch-managing the lifecycle of services.
 * It never instantiates services internally.
 */
export class ProjectServiceRegistry {
  private static readonly services: Map<string, IProjectService> = new Map();

  /**
   * Registers a project service instance with the locator.
   * @param service Concrete project service instance.
   */
  public static register(service: IProjectService): void {
    if (this.services.has(service.serviceId)) {
      throw new Error(`Service with ID '${service.serviceId}' is already registered.`);
    }
    this.services.set(service.serviceId, service);
  }

  /**
   * Looks up a registered service by its ID.
   * @param serviceId ID of the target service.
   */
  public static lookup(serviceId: string): IProjectService | undefined {
    return this.services.get(serviceId);
  }

  /**
   * Batch initializes all registered services.
   */
  public static async initializeAll(): Promise<void> {
    for (const service of this.services.values()) {
      await service.initialize();
    }
  }

  /**
   * Batch shuts down all registered services in reverse order.
   */
  public static async shutdownAll(): Promise<void> {
    const serviceList = Array.from(this.services.values()).reverse();
    for (const service of serviceList) {
      await service.shutdown();
    }
  }

  /**
   * Clears the registered services map (mainly for testing cleanup).
   */
  public static clear(): void {
    this.services.clear();
  }
}
