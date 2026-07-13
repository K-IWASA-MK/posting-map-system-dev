import { PerformancePolicyResult } from './PerformancePolicyResult';
import { RepositoryPerformanceMetrics } from '../../../infrastructure/repository/profiler/RepositoryPerformanceProfiler';

export interface PolicyContext {
  sourceCode: string;
  filePath: string;
  metrics?: RepositoryPerformanceMetrics;
}

export interface IPerformancePolicy {
  get id(): string;
  get name(): string;
  
  validate(context: PolicyContext): PerformancePolicyResult[];
}
