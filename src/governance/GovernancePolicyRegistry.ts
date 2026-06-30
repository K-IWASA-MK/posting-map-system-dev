import { GovernancePolicyDefinition } from "./GovernancePolicyDefinition";

export class GovernancePolicyRegistry {
  private registry: Map<string, GovernancePolicyDefinition> = new Map();

  public async add(definition: GovernancePolicyDefinition): Promise<boolean> {
    if (this.registry.has(definition.id)) {
      return false;
    }
    this.registry.set(definition.id, definition);
    return true;
  }

  public async remove(id: string): Promise<boolean> {
    return this.registry.delete(id);
  }

  public async find(id: string): Promise<GovernancePolicyDefinition | null> {
    return this.registry.get(id) || null;
  }

  public async list(): Promise<GovernancePolicyDefinition[]> {
    return Array.from(this.registry.values());
  }
}
