import { ValidatorRegistry } from '../registry/ValidatorRegistry';
import { ValidationPlan } from '../models/ValidationPlan';
import { IValidator } from '../validators/IValidator';

export class ValidatorSelectionService {
  constructor(private registry: ValidatorRegistry) {}

  public selectValidators(plan: ValidationPlan): Map<string, IValidator> {
    const selected = new Map<string, IValidator>();
    
    for (const vid of plan.executionOrder) {
      const validator = this.registry.getValidator(vid);
      if (!validator) {
        throw new Error(`Validator not found for ID: ${vid}`);
      }
      selected.set(vid, validator);
    }
    
    return selected;
  }
}
