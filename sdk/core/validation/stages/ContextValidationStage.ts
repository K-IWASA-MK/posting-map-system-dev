import { DevelopmentContext } from '../../context/DevelopmentContext';
import { IValidationStage } from '../IValidationStage';
import { ValidationArtifact, ValidationArtifactBuilder } from '../ValidationArtifact';
import { ValidationExecutionContext } from '../ValidationExecutionContext';
import { ValidationStageMetadata } from '../ValidationStageMetadata';
import { ValidationStageOutput } from '../ValidationStageOutput';
import { ValidationStageType } from '../ValidationStageType';

export class ContextValidationStage implements IValidationStage {
  public readonly metadata: ValidationStageMetadata = Object.freeze({
    type: ValidationStageType.CONTEXT,
    name: 'Context Dependency Stage',
    priority: 50,
    dependencies: [ValidationStageType.SEMANTIC],
    canSkip: false,
    estimatedCost: 50
  });

  public supports(context: DevelopmentContext): boolean {
    return true;
  }

  public async execute(context: ValidationExecutionContext, artifact: ValidationArtifact): Promise<ValidationStageOutput> {
    const startTime = Date.now();

    const outputArtifact = ValidationArtifactBuilder.createNext(artifact, this.metadata.type, {
      contextVerified: true
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
