export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
}

export class ResourceMonitor {
  private currentMetrics: SystemMetrics = { cpuUsage: 50, memoryUsage: 50, gpuUsage: 0 };

  public setMetrics(metrics: SystemMetrics): void {
    this.currentMetrics = metrics;
  }

  public getMetrics(): SystemMetrics {
    return this.currentMetrics;
  }
}
