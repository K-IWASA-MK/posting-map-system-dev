import { ContainerDefinition } from './ContainerDefinition';

export interface RegisteredContainer {
  definition: ContainerDefinition;
  status: string;
  updatedAt: string;
}

export class ContainerRegistry {
  private containers = new Map<string, RegisteredContainer>();

  public register(definition: ContainerDefinition, status: string): void {
    this.containers.set(definition.containerId, {
      definition,
      status,
      updatedAt: new Date().toISOString()
    });
  }

  public get(containerId: string): RegisteredContainer | undefined {
    return this.containers.get(containerId);
  }

  public list(): RegisteredContainer[] {
    return Array.from(this.containers.values());
  }

  public updateStatus(containerId: string, status: string): void {
    const entry = this.containers.get(containerId);
    if (entry) {
      this.containers.set(containerId, {
        ...entry,
        status,
        updatedAt: new Date().toISOString()
      });
    }
  }
}
