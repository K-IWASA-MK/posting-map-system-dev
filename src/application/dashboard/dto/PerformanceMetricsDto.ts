export interface PerformanceMetricsDto {
  responseTimeMs: number;
  spreadsheetReadCount: number;
  spreadsheetWriteCount: number;
  repositoryCallCount: number;
  activityRecordCount: number;
  holdingRecordCount: number;
  staffRecordCount: number;
  generatedAt: string;
  apiVersion: string;
  dashboardVersion: string;
}
