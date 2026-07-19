export interface IValidator {
  readonly id: string;
  readonly name: string;
  validate(): Promise<ValidationResult>;
}

export interface ValidationResult {
  validatorId: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  messages: string[];
  duration: number; // in milliseconds
}

export interface ValidationReport {
  timestamp: string;
  results: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
  };
  totalDuration: number;
  overallStatus: 'PASS' | 'WARNING' | 'FAIL';
}
