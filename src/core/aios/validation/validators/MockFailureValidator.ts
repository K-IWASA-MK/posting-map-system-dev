import { IValidator } from './IValidator';
import { ValidationResult } from '../models/ValidationResult';
import { ValidationScore } from '../models/ValidationScore';
import { ValidationSeverity, ValidationStatus } from '../models/ValidationEnums';

export class MockFailureValidator implements IValidator {
  id = 'mock-failure-validator';
  type = 'Mock';
  version = '1.0.0';

  async initialize(): Promise<void> {}
  
  supports(targetType: string): boolean { return true; }
  
  capabilities(): string[] { return ['FAILURE_MOCK']; }

  async validate(target: any, traceId: string): Promise<ValidationResult> {
    return {
      validationId: `val-${Date.now()}`,
      validatorId: this.id,
      validatorType: this.type,
      validatorVersion: this.version,
      policyVersion: '1.0',
      score: new ValidationScore(20, ValidationSeverity.CRITICAL, 0.95),
      status: ValidationStatus.FAILED,
      evidence: { error: 'Critical failure detected' },
      evidenceHash: 'hash-failure',
      artifacts: [],
      startedAt: new Date(),
      completedAt: new Date(),
      duration: 15,
      retryCount: 0,
      traceId,
      executionId: target.executionId || 'unknown-exec',
      governanceId: target.governanceId || 'unknown-gov',
      knowledgeCandidate: false
    };
  }

  async health(): Promise<boolean> { return true; }
  async shutdown(): Promise<void> {}
}
