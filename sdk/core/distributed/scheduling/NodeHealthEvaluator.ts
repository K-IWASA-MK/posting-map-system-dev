export interface NodeMetrics {
  cpuUsage: number;    // %
  memoryUsage: number; // %
  gpuUsage: number;    // %
}

export class NodeHealthEvaluator {
  public evaluate(metrics: NodeMetrics, baseScore: number): number {
    // Health score starts at baseScore (maximum 100). Subtract for high usage.
    const cpuDeduction = metrics.cpuUsage > 80 ? 20 : metrics.cpuUsage > 50 ? 10 : 0;
    const memDeduction = metrics.memoryUsage > 80 ? 20 : metrics.memoryUsage > 50 ? 10 : 0;
    const gpuDeduction = metrics.gpuUsage > 80 ? 15 : metrics.gpuUsage > 50 ? 5 : 0;

    const finalScore = baseScore - cpuDeduction - memDeduction - gpuDeduction;
    return Math.max(0, Math.min(100, finalScore));
  }
}
