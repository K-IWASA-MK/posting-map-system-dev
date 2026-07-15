import { DevelopmentContext } from '../../context/DevelopmentContext';
import { IValidationStage } from '../IValidationStage';
import { ValidationArtifact, ValidationArtifactBuilder } from '../ValidationArtifact';
import { ValidationExecutionContext } from '../ValidationExecutionContext';
import { ValidationStageMetadata } from '../ValidationStageMetadata';
import { ValidationStageOutput } from '../ValidationStageOutput';
import { ValidationStageType } from '../ValidationStageType';

export class SemanticValidationStage implements IValidationStage {
  public readonly metadata: ValidationStageMetadata = Object.freeze({
    type: ValidationStageType.SEMANTIC,
    name: 'Semantic Dependency Stage',
    priority: 40,
    dependencies: [ValidationStageType.AST],
    canSkip: false,
    estimatedCost: 40
  });

  public supports(context: DevelopmentContext): boolean {
    return true;
  }

  public async execute(context: ValidationExecutionContext, artifact: ValidationArtifact): Promise<ValidationStageOutput> {
    const startTime = Date.now();

    const outputArtifact = ValidationArtifactBuilder.createNext(artifact, this.metadata.type, {
      semanticErrorsFound: 0
    });

    return {
      result: {
        stage: this.metadata.type,
        status: 'PASS',
        violations: [],
        warnings: []
      },
      artifact: outputArtifact,
      metrics: {
        durationMs: Date.now() - startTime,
      }
    };
  }
}
