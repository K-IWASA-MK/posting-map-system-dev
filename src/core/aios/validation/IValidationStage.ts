import { DevelopmentContext } from '../context/DevelopmentContext';
import { ValidationArtifact } from './ValidationArtifact';
import { ValidationExecutionContext } from './ValidationExecutionContext';
import { ValidationStageMetadata } from './ValidationStageMetadata';
import { ValidationStageOutput } from './ValidationStageOutput';
import { ValidationStageType } from './ValidationStageType';

export interface IValidationStage {
  readonly metadata: ValidationStageMetadata;

  supports(context: DevelopmentContext): boolean;
  
  execute(context: ValidationExecutionContext, artifact: ValidationArtifact): Promise<ValidationStageOutput>;
}
