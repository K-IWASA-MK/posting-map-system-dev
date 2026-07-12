import { PerformancePolicyReport } from '../policy/PerformancePolicyReport';
import { RepositoryPerformanceMetrics } from '../../../infrastructure/repository/profiler/RepositoryPerformanceProfiler';
import { PerformanceValidationSummary } from './PerformanceValidationSummary';

export interface PerformanceValidationMetadata {
  toolVersion: string;
  schemaVersion: string;
  runtime: string;
  generatedAt: string;
}

export interface PerformanceValidationResult {
  metadata: PerformanceValidationMetadata;
  summary: PerformanceValidationSummary;
  metrics?: RepositoryPerformanceMetrics;
  report: PerformancePolicyReport;
}
