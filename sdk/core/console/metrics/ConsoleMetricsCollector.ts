export class ConsoleMetricsCollector {
  private apiRequests: number = 0;
  private eventProcessTime: number[] = [];

  public recordApiRequest(): void {
    this.apiRequests++;
  }

  public recordEventProcessed(durationMs: number): void {
    this.eventProcessTime.push(durationMs);
    if (this.eventProcessTime.length > 100) {
      this.eventProcessTime.shift();
    }
  }

  public getMetrics(): any {
    const avgProcessTime = this.eventProcessTime.length > 0 
      ? this.eventProcessTime.reduce((a, b) => a + b, 0) / this.eventProcessTime.length 
      : 0;

    return {
      apiRequests: this.apiRequests,
      avgEventProcessTimeMs: avgProcessTime
    };
  }
}
