import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { ValidationResult } from './ValidationResult';
import { ValidatorChain } from './ValidatorChain';
import { RequestValidator } from './validators/RequestValidator';
import { MethodValidator } from './validators/MethodValidator';
import { VersionValidator } from './validators/VersionValidator';
import { RouteValidator } from './validators/RouteValidator';
import { FeatureValidator } from './validators/FeatureValidator';
import { ValidationException } from './ValidationException';

export class ValidationPipeline {
  private static instance: ValidationPipeline | null = null;
  private readonly chain: ValidatorChain;

  private constructor() {
    this.chain = new ValidatorChain();
    this.registerValidators();
  }

  public static getInstance(): ValidationPipeline {
    if (!ValidationPipeline.instance) {
      ValidationPipeline.instance = new ValidationPipeline();
    }
    return ValidationPipeline.instance;
  }

  private registerValidators(): void {
    this.chain
      .addValidator(new RequestValidator())
      .addValidator(new MethodValidator())
      .addValidator(new VersionValidator())
      .addValidator(new RouteValidator())
      .addValidator(new FeatureValidator());
  }

  public validate(request: ApiRequest, context: ApiExecutionContext): ValidationResult {
    const result = this.chain.validate(request, context);
    if (!result.valid) {
      throw new ValidationException(result);
    }
    return result;
  }
}
