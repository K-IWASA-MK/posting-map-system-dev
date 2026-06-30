import { AutonomousReviewRuntimeDefinition } from "./AutonomousReviewRuntimeDefinition";

export class AutonomousReviewRuntimeRegistry {
  private registry: Map<string, AutonomousReviewRuntimeDefinition> = new Map();

  public async add(definition: AutonomousReviewRuntimeDefinition): Promise<boolean> {
    if (this.registry.has(definition.id)) {
      return false;
    }
    this.registry.set(definition.id, definition);
    return true;
  }

  public async remove(id: string): Promise<boolean> {
    return this.registry.delete(id);
  }

  public async find(id: string): Promise<AutonomousReviewRuntimeDefinition | null> {
    return this.registry.get(id) || null;
  }

  public async list(): Promise<AutonomousReviewRuntimeDefinition[]> {
    return Array.from(this.registry.values());
  }
}
