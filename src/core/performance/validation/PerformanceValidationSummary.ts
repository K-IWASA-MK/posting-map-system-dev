export type PerformanceValidationStatus = 'PASS' | 'WARNING' | 'FAILED';

export interface PerformanceValidationSummary {
  status: PerformanceValidationStatus;
  validationCount: number;
  passed: number;
  warning: number;
  failed: number;
  info: number;
  score: number;
  durationMs: number;
  generatedAt: string;
}
