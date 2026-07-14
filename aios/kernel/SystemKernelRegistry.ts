export class SystemKernelRegistry {
  private layers: Map<string, Record<string, any>> = new Map();

  public async registerLayer(name: string, info: Record<string, any>): Promise<boolean> {
    if (this.layers.has(name)) {
      return false;
    }
    this.layers.set(name, info);
    return true;
  }

  public async findLayer(name: string): Promise<Record<string, any> | null> {
    return this.layers.get(name) || null;
  }

  public async listLayers(): Promise<Record<string, any>[]> {
    return Array.from(this.layers.values());
  }

  public async removeLayer(name: string): Promise<boolean> {
    return this.layers.delete(name);
  }
}
