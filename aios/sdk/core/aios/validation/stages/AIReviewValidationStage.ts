import { DevelopmentContext } from '../../context/DevelopmentContext';
import { IValidationStage } from '../IValidationStage';
import { ValidationArtifact, ValidationArtifactBuilder } from '../ValidationArtifact';
import { ValidationExecutionContext } from '../ValidationExecutionContext';
import { ValidationStageMetadata } from '../ValidationStageMetadata';
import { ValidationStageOutput } from '../ValidationStageOutput';
import { ValidationStageType } from '../ValidationStageType';
import { ReviewerRegistry } from '../../reviewer/ReviewerRegistry';
import { ReviewerLoader } from '../../reviewer/ReviewerLoader';
import { ReviewRequest } from '../../reviewer/ReviewRequest';
import { DevelopmentPluginId } from '../../plugin/DevelopmentPluginId';

export class AIReviewValidationStage implements IValidationStage {
  public readonly metadata: ValidationStageMetadata = Object.freeze({
    type: ValidationStageType.AI_REVIEW,
    name: 'AI LLM Review Stage',
    priority: 1000,
    dependencies: [ValidationStageType.CONTEXT],
    canSkip: true,
    estimatedCost: 1000
  });

  private reviewerRegistry: ReviewerRegistry;
  private reviewerLoader: ReviewerLoader;

  constructor(reviewerRegistry: ReviewerRegistry) {
    this.reviewerRegistry = reviewerRegistry;
    this.reviewerLoader = new ReviewerLoader();
  }

  public supports(context: DevelopmentContext): boolean {
    return true;
  }

  public async execute(context: ValidationExecutionContext, artifact: ValidationArtifact): Promise<ValidationStageOutput> {
    const startTime = Date.now();

    // 1. Get optimal reviewers with fallback order
    const optimalReviewers = this.reviewerLoader.findOptimal(this.reviewerRegistry, context.context);

    if (optimalReviewers.length === 0) {
      throw new Error('No supported Reviewers found in Registry.');
    }

    // 2. Prepare ReviewRequest
    // In a real scenario, pipelineResult and pluginMetadata would be injected properly.
    const request: ReviewRequest = {
      context: context.context,
      validationArtifact: artifact,
      pipelineResult: null as any, // Mock for now
      pluginMetadata: { id: DevelopmentPluginId.Architecture } as any, // Mock for now
      instructions: 'Review the architecture and identify performance bottlenecks.'
    };

    // 3. Execute Review with Fallback Logic
    let finalReviewResult = null;
    let selectedReviewerId = '';

    for (const selection of optimalReviewers) {
      try {
        console.log(`[AIReviewValidationStage] Attempting review with ${selection.reviewer.metadata.name} (Reason: ${selection.selectionReason})`);
        finalReviewResult = await selection.reviewer.review(request);
        selectedReviewerId = selection.reviewer.metadata.id;
        break; // Success, break the fallback loop
      } catch (error) {
        console.warn(`[AIReviewValidationStage] Reviewer ${selection.reviewer.metadata.name} failed. Falling back to next...`, error);
        // Continue to next reviewer
      }
    }

    if (!finalReviewResult) {
      throw new Error('All reviewers failed to process the request.');
    }

    // 4. Wrap ReviewResult in ValidationArtifact
    const outputArtifact = ValidationArtifactBuilder.createNext(artifact, this.metadata.type, {
      aiReviewResult: finalReviewResult,
      reviewerUsed: selectedReviewerId
    });

    return {
      result: {
        stage: this.metadata.type,
        status: 'PASS',
        violations: finalReviewResult.findings,
        warnings: []
      },
      artifact: outputArtifact,
      metrics: {
        durationMs: Date.now() - startTime,
      }
    };
  }
}
