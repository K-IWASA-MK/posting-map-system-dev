import { ValidationSeverity } from '../models/ValidationEnums';

export interface ScoringPolicy {
  minimumGlobalScore: number;
  maximumCriticalCount: number;
  maximumMajorCount: number;
  severityWeights: Record<ValidationSeverity, number>;
}
