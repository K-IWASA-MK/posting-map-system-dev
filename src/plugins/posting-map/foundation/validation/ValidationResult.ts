import { ValidationErrorCode } from './ValidationError';

export class ValidationResult {
  public readonly valid: boolean;
  public readonly errors: Array<{ code: ValidationErrorCode; message: string; validatorId: string }>;
  public readonly warnings: Array<{ message: string }>;
  public readonly metadata: {
    validatedAt: number;
    duration: number;
  };

  constructor(params: {
    valid: boolean;
    errors?: Array<{ code: ValidationErrorCode; message: string; validatorId: string }>;
    warnings?: Array<{ message: string }>;
    metadata: {
      validatedAt: number;
      duration: number;
    };
  }) {
    this.valid = params.valid;
    this.errors = params.errors || [];
    this.warnings = params.warnings || [];
    this.metadata = params.metadata;
  }

  public static success(validatedAt: number, duration: number): ValidationResult {
    return new ValidationResult({
      valid: true,
      metadata: { validatedAt, duration }
    });
  }

  public static failure(
    errors: Array<{ code: ValidationErrorCode; message: string; validatorId: string }>,
    validatedAt: number,
    duration: number
  ): ValidationResult {
    return new ValidationResult({
      valid: false,
      errors,
      metadata: { validatedAt, duration }
    });
  }
}
