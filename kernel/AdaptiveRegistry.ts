export class AdaptiveRegistry {
  private contexts: Map<string, Record<string, any>> = new Map();

  public async registerContext(id: string, context: Record<string, any>): Promise<boolean> {
    if (this.contexts.has(id)) {
      return false;
    }
    this.contexts.set(id, context);
    return true;
  }

  public async findContext(id: string): Promise<Record<string, any> | null> {
    return this.contexts.get(id) || null;
  }

  public async listContexts(): Promise<Record<string, any>[]> {
    return Array.from(this.contexts.values());
  }

  public async removeContext(id: string): Promise<boolean> {
    return this.contexts.delete(id);
  }
}
