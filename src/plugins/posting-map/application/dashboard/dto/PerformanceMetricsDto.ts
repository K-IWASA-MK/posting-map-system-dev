export interface PerformanceMetricsDto {
  responseTimeMs: number;
  spreadsheetReadCount: number;
  spreadsheetWriteCount: number;
  repositoryCallCount: number;
  repositoryExecutionCount: Array<{ repositoryName: string; executionCount: number }>;
  sheetMetrics: Array<{ sheetName: string; readCount: number; writeCount: number }>;
  activityRecordCount: number;
  holdingRecordCount: number;
  staffRecordCount: number;
  generatedAt: string;
  apiVersion: string;
  dashboardVersion: string;
}
