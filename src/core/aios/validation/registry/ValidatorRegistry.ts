import { IValidator } from '../validators/IValidator';

export class ValidatorRegistry {
  private validators: Map<string, IValidator> = new Map();

  public register(validator: IValidator): void {
    if (this.validators.has(validator.id)) {
      throw new Error(`Validator with ID ${validator.id} is already registered.`);
    }
    this.validators.set(validator.id, validator);
  }

  public getValidator(id: string): IValidator | undefined {
    return this.validators.get(id);
  }

  public getValidatorsForType(targetType: string): IValidator[] {
    return Array.from(this.validators.values()).filter(v => v.supports(targetType));
  }

  public getAll(): IValidator[] {
    return Array.from(this.validators.values());
  }

  public clear(): void {
    this.validators.clear();
  }
}
