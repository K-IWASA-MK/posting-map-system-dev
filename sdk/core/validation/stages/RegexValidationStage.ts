import { DevelopmentContext } from '../../context/DevelopmentContext';
import { IValidationStage } from '../IValidationStage';
import { ValidationArtifact, ValidationArtifactBuilder } from '../ValidationArtifact';
import { ValidationExecutionContext } from '../ValidationExecutionContext';
import { ValidationStageMetadata } from '../ValidationStageMetadata';
import { ValidationStageOutput } from '../ValidationStageOutput';
import { ValidationStageType } from '../ValidationStageType';

export class RegexValidationStage implements IValidationStage {
  public readonly metadata: ValidationStageMetadata = Object.freeze({
    type: ValidationStageType.REGEX,
    name: 'Regex Fast Filter Stage',
    priority: 1, // Runs first
    dependencies: [],
    canSkip: false,
    estimatedCost: 1
  });

  public supports(context: DevelopmentContext): boolean {
    return true; // Usually runs on almost all code contexts
  }

  public async execute(context: ValidationExecutionContext, artifact: ValidationArtifact): Promise<ValidationStageOutput> {
    const startTime = Date.now();

    // Mock logic: Regex finds some bad patterns
    const outputArtifact = ValidationArtifactBuilder.createNext(artifact, this.metadata.type, {
      regexMatches: ['Found bad pattern A', 'Found bad pattern B']
    });

    return {
      result: {
        stage: this.metadata.type,
        status: 'PASS',
        violations: [],
        warnings: [{
          id: 'REGEX-001',
          message: 'Found potential bad pattern',
          file: 'src/example.ts',
          severity: 'WARNING',
          source: this.metadata.type
        }]
      },
      artifact: outputArtifact,
      metrics: {
        durationMs: Date.now() - startTime,
        evaluatedFilesCount: 5,
        cacheHits: 0
      }
    };
  }
}
