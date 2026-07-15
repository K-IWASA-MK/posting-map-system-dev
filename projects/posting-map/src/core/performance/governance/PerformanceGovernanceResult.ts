import { PerformanceValidationMetadata, PerformanceValidationResult } from '../validation/PerformanceValidationResult';
import { PerformanceGovernanceDecision } from './PerformanceGovernanceDecision';

export interface PerformanceGovernanceResult {
  metadata: PerformanceValidationMetadata;
  decision: PerformanceGovernanceDecision;
  validationResult: PerformanceValidationResult;
}
