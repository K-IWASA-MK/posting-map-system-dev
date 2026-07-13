import { ValidationArtifact, ValidationArtifactBuilder } from './ValidationArtifact';
import { ValidationExecutionContext } from './ValidationExecutionContext';
import { IValidationStage } from './IValidationStage';
import { ValidationPipelineResult } from './ValidationPipelineResult';
import { ValidationStageResult } from './ValidationStageResult';
import { ValidationStageType } from './ValidationStageType';

export class ValidationPipeline {
  private readonly stages: readonly IValidationStage[];

  constructor(stages: IValidationStage[]) {
    // Sort by priority (lower priority executes first, e.g. Regex(1) -> AST(10))
    this.stages = Object.freeze([...stages].sort((a, b) => a.metadata.priority - b.metadata.priority));
  }

  public async execute(context: ValidationExecutionContext): Promise<ValidationPipelineResult> {
    const startTime = Date.now();
    let currentArtifact: ValidationArtifact = ValidationArtifactBuilder.createInitial();
    
    const stageResults: ValidationStageResult[] = [];
    const executedStages: ValidationStageType[] = [];
    const skippedStages: ValidationStageType[] = [];
    const failedStages: ValidationStageType[] = [];
    let estimatedCost = 0;
    let actualCost = 0;

    for (const stage of this.stages) {
      if (!stage.supports(context.context)) {
        skippedStages.push(stage.metadata.type);
        continue;
      }

      // If a previous critical stage failed, we might skip depending on strategy, but for now we run all that support the context unless they internally skip.
      executedStages.push(stage.metadata.type);
      estimatedCost += stage.metadata.estimatedCost;
      actualCost += stage.metadata.estimatedCost; // In real scenarios, actualCost might be calculated from tokens

      try {
        const output = await stage.execute(context, currentArtifact);
        
        stageResults.push(output.result);
        
        // Pass the new immutable artifact to the next stage
        currentArtifact = output.artifact;

        if (output.result.status === 'FAIL' || output.result.status === 'ERROR') {
          failedStages.push(stage.metadata.type);
          // Rule-005: Stages don't break the pipeline completely, but we might halt execution for severity.
          // For now, we continue gathering results or we could break. Let's assume we continue to gather all violations.
        }

      } catch (error) {
        console.error(`Validation Stage ${stage.metadata.type} threw an unhandled error:`, error);
        failedStages.push(stage.metadata.type);
        stageResults.push({
          stage: stage.metadata.type,
          status: 'ERROR',
          violations: [{
            id: 'STAGE_CRASH',
            message: error instanceof Error ? error.message : 'Unknown error',
            file: 'unknown',
            severity: 'ERROR',
            source: stage.metadata.type
          }],
          warnings: []
        });
      }
    }

    const totalDurationMs = Date.now() - startTime;

    return Object.freeze({
      stageResults: Object.freeze(stageResults),
      totalDurationMs,
      executedStages: Object.freeze(executedStages),
      skippedStages: Object.freeze(skippedStages),
      failedStages: Object.freeze(failedStages),
      estimatedCost,
      actualCost,
      generatedAt: new Date().toISOString()
    });
  }
}
