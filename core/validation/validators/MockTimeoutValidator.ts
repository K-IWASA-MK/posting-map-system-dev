import { IValidator } from './IValidator';
import { ValidationResult } from '../models/ValidationResult';
import { ValidationScore } from '../models/ValidationScore';
import { ValidationSeverity, ValidationStatus } from '../models/ValidationEnums';

export class MockTimeoutValidator implements IValidator {
  id = 'mock-timeout-validator';
  type = 'Mock';
  version = '1.0.0';
  private attempt = 0;

  async initialize(): Promise<void> {}
  
  supports(targetType: string): boolean { return true; }
  
  capabilities(): string[] { return ['TIMEOUT_MOCK']; }

  async validate(target: any, traceId: string): Promise<ValidationResult> {
    this.attempt++;
    // Simulate flaky behavior: fails first time, succeeds second time
    if (this.attempt === 1) {
      throw new Error('TimeoutError: Validator timed out');
    }
    
    return {
      validationId: `val-${Date.now()}`,
      validatorId: this.id,
      validatorType: this.type,
      validatorVersion: this.version,
      policyVersion: '1.0',
      score: new ValidationScore(95, ValidationSeverity.PASS, 0.9),
      status: ValidationStatus.COMPLETED,
      evidence: { message: 'Passed on retry' },
      evidenceHash: 'hash-timeout-success',
      artifacts: [],
      startedAt: new Date(),
      completedAt: new Date(),
      duration: 50,
      retryCount: this.attempt - 1,
      traceId,
      executionId: target.executionId || 'unknown-exec',
      governanceId: target.governanceId || 'unknown-gov',
      knowledgeCandidate: true
    };
  }

  async health(): Promise<boolean> { return true; }
  async shutdown(): Promise<void> {}
}
