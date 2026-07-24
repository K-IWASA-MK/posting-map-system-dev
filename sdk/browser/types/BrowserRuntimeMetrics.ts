export interface BrowserRuntimeMetrics {
  connectionTimeMs: number;
  navigationTimeMs: number;
  memoryUsageMb: number;
  cpuPercent: number;
  evidenceSizeBytes: number;
  reconnectCount: number;
  healthScore: number; // 0 - 100
}
