import { IValidator } from './IValidator';
import { ValidationResult } from '../models/ValidationResult';
import { ValidationScore } from '../models/ValidationScore';
import { ValidationSeverity, ValidationStatus } from '../models/ValidationEnums';

export class MockWarningValidator implements IValidator {
  id = 'mock-warning-validator';
  type = 'Mock';
  version = '1.0.0';

  async initialize(): Promise<void> {}
  
  supports(targetType: string): boolean { return true; }
  
  capabilities(): string[] { return ['WARNING_MOCK']; }

  async validate(target: any, traceId: string): Promise<ValidationResult> {
    return {
      validationId: `val-${Date.now()}`,
      validatorId: this.id,
      validatorType: this.type,
      validatorVersion: this.version,
      policyVersion: '1.0',
      score: new ValidationScore(80, ValidationSeverity.WARNING, 0.8),
      status: ValidationStatus.COMPLETED,
      evidence: { message: 'Passed with warnings' },
      evidenceHash: 'hash-warning',
      artifacts: [],
      startedAt: new Date(),
      completedAt: new Date(),
      duration: 12,
      retryCount: 0,
      traceId,
      executionId: target.executionId || 'unknown-exec',
      governanceId: target.governanceId || 'unknown-gov',
      knowledgeCandidate: true
    };
  }

  async health(): Promise<boolean> { return true; }
  async shutdown(): Promise<void> {}
}
