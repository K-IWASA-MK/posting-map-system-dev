import { DevelopmentContext } from '../context/DevelopmentContext';
import { ValidationPipeline } from './ValidationPipeline';
import { ValidationStageRegistry } from './ValidationStageRegistry';

export class ValidationPipelineBuilder {
  private registry: ValidationStageRegistry;

  constructor(registry: ValidationStageRegistry) {
    this.registry = registry;
  }

  public build(context: DevelopmentContext): ValidationPipeline {
    // Determine which stages are needed based on Context
    const supportedStages = this.registry.findSupported(context);
    
    // The pipeline constructor handles priority sorting
    return new ValidationPipeline(supportedStages);
  }
}
