import { DevelopmentContext } from '../context/DevelopmentContext';
import { IValidationStage } from './IValidationStage';
import { ValidationStageType } from './ValidationStageType';

export class ValidationStageRegistry {
  private stages: Map<ValidationStageType, IValidationStage> = new Map();

  public register(stage: IValidationStage): void {
    const type = stage.metadata.type;
    if (this.stages.has(type)) {
      throw new Error(`Validation stage of type '${type}' is already registered.`);
    }
    this.stages.set(type, stage);
  }

  public findAll(): IValidationStage[] {
    return Array.from(this.stages.values());
  }

  public findByType(type: ValidationStageType): IValidationStage | undefined {
    return this.stages.get(type);
  }

  public findSupported(context: DevelopmentContext): IValidationStage[] {
    return this.findAll().filter(stage => stage.supports(context));
  }

  public clear(): void {
    this.stages.clear();
  }
}
