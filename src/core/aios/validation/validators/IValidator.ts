import { ValidationResult } from '../models/ValidationResult';

export interface IValidator {
  readonly id: string;
  readonly type: string;
  readonly version: string;

  initialize(): Promise<void>;
  supports(targetType: string): boolean;
  capabilities(): string[];
  
  validate(target: any, traceId: string): Promise<ValidationResult>;
  
  health(): Promise<boolean>;
  shutdown(): Promise<void>;
}
