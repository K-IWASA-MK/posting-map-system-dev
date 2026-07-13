export class KernelRuntimeRegistry {
  private metrics: Map<string, any> = new Map();

  public async registerMetric(name: string, value: any): Promise<boolean> {
    if (this.metrics.has(name)) {
      return false;
    }
    this.metrics.set(name, value);
    return true;
  }

  public async findMetric(name: string): Promise<any | null> {
    return this.metrics.get(name) || null;
  }

  public async listMetrics(): Promise<any[]> {
    return Array.from(this.metrics.values());
  }

  public async removeMetric(name: string): Promise<boolean> {
    return this.metrics.delete(name);
  }
}
