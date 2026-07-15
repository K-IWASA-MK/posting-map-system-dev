import { ExecutionDefinition } from "./ExecutionDefinition";

export class ExecutionRegistry {
  private registry: Map<string, ExecutionDefinition> = new Map();

  public async add(definition: ExecutionDefinition): Promise<boolean> {
    if (this.registry.has(definition.id)) {
      return false;
    }
    this.registry.set(definition.id, definition);
    return true;
  }

  public async find(id: string): Promise<ExecutionDefinition | null> {
    return this.registry.get(id) || null;
  }

  public async list(): Promise<ExecutionDefinition[]> {
    return Array.from(this.registry.values());
  }

  public async remove(id: string): Promise<boolean> {
    return this.registry.delete(id);
  }
}
