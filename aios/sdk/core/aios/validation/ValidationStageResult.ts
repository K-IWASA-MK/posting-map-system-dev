import { ValidationViolation } from './ValidationArtifact';
import { ValidationStageType } from './ValidationStageType';

export interface ValidationStageResult {
  readonly stage: ValidationStageType;
  readonly status: 'PASS' | 'FAIL' | 'SKIPPED' | 'ERROR';
  readonly violations: readonly ValidationViolation[];
  readonly warnings: readonly ValidationViolation[];
}
