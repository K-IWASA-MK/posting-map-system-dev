import { ValidationPlan } from '../models/ValidationPlan';
import { ValidationResult } from '../models/ValidationResult';
import { IValidator } from '../validators/IValidator';
import { ValidationStatus } from '../models/ValidationEnums';

export class ValidationPipelineService {
  public async executePipeline(
    plan: ValidationPlan,
    validators: Map<string, IValidator>,
    targetPayload: any
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    for (const validatorId of plan.executionOrder) {
      const validator = validators.get(validatorId)!;
      let attempt = 0;
      let success = false;
      let lastError: any;
      
      while (attempt <= plan.retryPolicy.maxRetries && !success) {
        try {
          // Check for timeout mechanism can be added here
          const result = await validator.validate(targetPayload, plan.executionTraceId);
          results.push(result);
          success = true;
        } catch (error: any) {
          lastError = error;
          const isRetryable = plan.retryPolicy.retryableErrors.some((e: string) => error.message.includes(e));
          if (!isRetryable) {
            break; // Hard fail
          }
          attempt++;
        }
      }
      
      if (!success) {
        // Create FAILED result
        if (plan.policy.failFast) {
          throw new Error(`Pipeline aborted due to failure in ${validatorId}: ${lastError.message}`);
        }
      }
    }
    
    return results;
  }
}
