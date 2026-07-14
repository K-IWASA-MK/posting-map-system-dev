import { ResumeScopeDefinition } from "./ResumeScopeDefinition";

export class ResumeScopeRegistry {
  private registry: Map<string, ResumeScopeDefinition> = new Map();

  public async add(definition: ResumeScopeDefinition): Promise<boolean> {
    if (this.registry.has(definition.id)) {
      return false;
    }
    this.registry.set(definition.id, definition);
    return true;
  }

  public async find(id: string): Promise<ResumeScopeDefinition | null> {
    return this.registry.get(id) || null;
  }

  public async list(): Promise<ResumeScopeDefinition[]> {
    return Array.from(this.registry.values());
  }

  public async remove(id: string): Promise<boolean> {
    return this.registry.delete(id);
  }
}
