import { ValidationSeverity, ValidationConfidence } from './ValidationEnums';

export class ValidationScore {
  constructor(
    public readonly score: number, // 0 to 100
    public readonly severity: ValidationSeverity,
    public readonly confidence: ValidationConfidence // 0.0 to 1.0
  ) {}

  public isPassing(threshold: number): boolean {
    return this.score >= threshold && this.severity !== ValidationSeverity.CRITICAL;
  }
}
