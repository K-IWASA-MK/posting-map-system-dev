import { KnowledgeDefinition } from "./KnowledgeDefinition";

export class KnowledgeRegistry {
  private registry: Map<string, KnowledgeDefinition> = new Map();

  public async add(definition: KnowledgeDefinition): Promise<boolean> {
    if (this.registry.has(definition.id)) {
      return false;
    }
    this.registry.set(definition.id, definition);
    return true;
  }

  public async remove(id: string): Promise<boolean> {
    return this.registry.delete(id);
  }

  public async find(id: string): Promise<KnowledgeDefinition | null> {
    return this.registry.get(id) || null;
  }

  public async list(): Promise<KnowledgeDefinition[]> {
    return Array.from(this.registry.values());
  }
}
